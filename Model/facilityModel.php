<?php
class FacilityModel {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getFacilityById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM facilities WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getFacilityByCode($code) {
        $stmt = $this->conn->prepare("SELECT * FROM facilities WHERE code = ?");
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getFacilityMembers($facilityId) {
        $stmt = $this->conn->prepare("
            SELECT u.id, u.name, u.email, u.profile_picture, 
                   CASE 
                       WHEN f.owner_id = u.id THEN 'owner'
                       WHEN EXISTS (SELECT 1 FROM facility_admins fa WHERE fa.user_id = u.id AND fa.facility_id = ?) THEN 'admin'
                       ELSE 'member'
                   END as role,
                   fm.joined_at
            FROM users u
            JOIN facility_members fm ON u.id = fm.user_id
            JOIN facilities f ON fm.facility_id = f.id
            WHERE fm.facility_id = ?
            ORDER BY 
                CASE 
                    WHEN f.owner_id = u.id THEN 1
                    WHEN EXISTS (SELECT 1 FROM facility_admins fa WHERE fa.user_id = u.id AND fa.facility_id = ?) THEN 2
                    ELSE 3
                END,
                u.name
        ");
        $stmt->execute([$facilityId, $facilityId, $facilityId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function regenerateFacilityCode($facilityId, $userId) {
        // Verify user is owner
        $facility = $this->getFacilityById($facilityId);
        if (!$facility || $facility['owner_id'] != $userId) {
            return false;
        }

        $newCode = $this->generateUniqueCode();
        $stmt = $this->conn->prepare("UPDATE facilities SET code = ? WHERE id = ?");
        return $stmt->execute([$newCode, $facilityId]) ? $newCode : false;
    }

    public function addMember($facilityId, $userId, $invitedBy) {
        try {
            $stmt = $this->conn->prepare("INSERT INTO facility_members (facility_id, user_id) VALUES (?, ?)");
            return $stmt->execute([$facilityId, $userId]);
        } catch (PDOException $e) {
            // Handle duplicate entry
            if ($e->errorInfo[1] == 1062) {
                return true; // Already a member
            }
            return false;
        }
    }

    public function removeMember($facilityId, $userId, $requestedBy) {
        // Verify requester has permission (owner or admin)
        $facility = $this->getFacilityById($facilityId);
        if (!$this->canManageMembers($facilityId, $requestedBy)) {
            return false;
        }

        // Can't remove owner
        if ($facility['owner_id'] == $userId) {
            return false;
        }

        // Remove from admins first if they are admin
        $this->conn->prepare("DELETE FROM facility_admins WHERE facility_id = ? AND user_id = ?")
            ->execute([$facilityId, $userId]);

        // Remove from members
        $stmt = $this->conn->prepare("DELETE FROM facility_members WHERE facility_id = ? AND user_id = ?");
        return $stmt->execute([$facilityId, $userId]);
    }

    public function makeAdmin($facilityId, $userId, $assignedBy) {
        if (!$this->canManageMembers($facilityId, $assignedBy)) {
            return false;
        }

        try {
            $stmt = $this->conn->prepare("
                INSERT INTO facility_admins (facility_id, user_id, assigned_by) 
                VALUES (?, ?, ?)
            ");
            return $stmt->execute([$facilityId, $userId, $assignedBy]);
        } catch (PDOException $e) {
            // Handle duplicate entry
            if ($e->errorInfo[1] == 1062) {
                return true; // Already an admin
            }
            return false;
        }
    }

    public function revokeAdmin($facilityId, $userId, $requestedBy) {
        if (!$this->canManageMembers($facilityId, $requestedBy)) {
            return false;
        }

        $stmt = $this->conn->prepare("
            DELETE FROM facility_admins 
            WHERE facility_id = ? AND user_id = ?
        ");
        return $stmt->execute([$facilityId, $userId]);
    }

    public function sendInvitation($facilityId, $email, $invitedBy) {
        $code = $this->generateUniqueCode();
        $stmt = $this->conn->prepare("
            INSERT INTO facility_invitations 
            (facility_id, email, code, invited_by) 
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$facilityId, $email, $code, $invitedBy]) ? $code : false;
    }

    private function canManageMembers($facilityId, $userId) {
        $facility = $this->getFacilityById($facilityId);
        if (!$facility) return false;

        // Owner can always manage members
        if ($facility['owner_id'] == $userId) {
            return true;
        }

        // Check if user is admin
        $stmt = $this->conn->prepare("
            SELECT 1 FROM facility_admins 
            WHERE facility_id = ? AND user_id = ?
        ");
        $stmt->execute([$facilityId, $userId]);
        return $stmt->rowCount() > 0;
    }

    private function generateUniqueCode() {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $chars[rand(0, strlen($chars) - 1)];
                if ($i === 3) $code .= '-';
            }
            
            $stmt = $this->conn->prepare("SELECT 1 FROM facilities WHERE code = ?");
            $stmt->execute([$code]);
        } while ($stmt->rowCount() > 0);
        
        return $code;
    }

    public function generateFacilityCode() {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 8; $i++) {
            $code .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $code;
    }
    
    public function updateFacilityCode($facilityId, $code) {
        $stmt = $this->conn->prepare("UPDATE facilities SET code = ? WHERE id = ?");
        return $stmt->execute([$code, $facilityId]);
    }
    
    public function updateMemberRole($facilityId, $userId, $role) {
        // Verify current user has permission
        if (!$this->canManageMembers($facilityId, $_SESSION['user_id'])) {
            return false;
        }
    
        // Check if user is owner (can't change owner's role)
        $facility = $this->getFacilityById($facilityId);
        if ($facility['owner_id'] == $userId) {
            return false;
        }
    
        if ($role === 'admin') {
            $stmt = $this->conn->prepare("INSERT INTO facility_admins (facility_id, user_id, assigned_by) VALUES (?, ?, ?)");
            return $stmt->execute([$facilityId, $userId, $_SESSION['user_id']]);
        } else {
            $stmt = $this->conn->prepare("DELETE FROM facility_admins WHERE facility_id = ? AND user_id = ?");
            return $stmt->execute([$facilityId, $userId]);
        }
    }
    
    public function removeFacilityMember($facilityId, $userId) {
        // Verify current user has permission
        if (!$this->canManageMembers($facilityId, $_SESSION['user_id'])) {
            return false;
        }
    
        // Can't remove owner
        $facility = $this->getFacilityById($facilityId);
        if ($facility['owner_id'] == $userId) {
            return false;
        }
    
        // First remove admin privileges if any
        $this->conn->prepare("DELETE FROM facility_admins WHERE facility_id = ? AND user_id = ?")
            ->execute([$facilityId, $userId]);
            
        // Then remove from members
        $stmt = $this->conn->prepare("DELETE FROM facility_members WHERE facility_id = ? AND user_id = ?");
        return $stmt->execute([$facilityId, $userId]);
    }
}