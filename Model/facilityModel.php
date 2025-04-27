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
        $facility = $this->getFacilityById($facilityId);
        if (!$facility) {
            return [];
        }
        
        $stmt = $this->conn->prepare("
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.profile_picture,
                CASE 
                    WHEN u.id = ? THEN 'owner'
                    WHEN EXISTS (
                        SELECT 1 FROM facility_admins fa 
                        WHERE fa.user_id = u.id AND fa.facility_id = ?
                    ) THEN 'admin'
                    ELSE 'member'
                END as role,
                fm.joined_at
            FROM users u
            JOIN facility_members fm ON u.id = fm.user_id
            WHERE fm.facility_id = ?
            ORDER BY 
                CASE 
                    WHEN u.id = ? THEN 1
                    WHEN EXISTS (
                        SELECT 1 FROM facility_admins fa 
                        WHERE fa.user_id = u.id AND fa.facility_id = ?
                    ) THEN 2
                    ELSE 3
                END,
                u.name
        ");
        $stmt->execute([
            $facility['owner_id'],
            $facilityId,
            $facilityId,
            $facility['owner_id'],
            $facilityId
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function regenerateFacilityCode($facilityId, $userId) {
        $newCode = $this->generateUniqueCode();
        $stmt = $this->conn->prepare("UPDATE facilities SET code = ? WHERE id = ?");
        return $stmt->execute([$newCode, $facilityId]) ? $newCode : false;
    }

    public function addMember($facilityId, $userId, $invitedBy) {
        try {
            if (!is_numeric($facilityId) || !is_numeric($userId)) {
                throw new InvalidArgumentException("Invalid ID parameters");
            }
            
            $facilityId = (int)$facilityId;
            $userId = (int)$userId;
            if (!$this->facilityExists($facilityId)) {
                throw new Exception("Facility not found");
            }
            if (!$this->userExists($userId)) {
                throw new Exception("User not found");
            }
            $stmt = $this->conn->prepare("
                SELECT 1 FROM facility_members 
                WHERE facility_id = ? AND user_id = ?
            ");
            $stmt->execute([$facilityId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                return false;
            }
            $stmt = $this->conn->prepare("
                INSERT INTO facility_members (facility_id, user_id, joined_at) 
                VALUES (?, ?, NOW())
            ");
            $success = $stmt->execute([$facilityId, $userId]);
            
            if ($success) {
                $this->conn->prepare("
                    UPDATE users SET default_facility_id = ? 
                    WHERE id = ? AND default_facility_id IS NULL
                ")->execute([$facilityId, $userId]);
                
                return true;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error adding member: " . $e->getMessage());
            return false;
        }
    }

    private function facilityExists($facilityId) {
        $stmt = $this->conn->prepare("SELECT 1 FROM facilities WHERE id = ?");
        $stmt->execute([$facilityId]);
        return $stmt->rowCount() > 0;
    }
    
    private function userExists($userId) {
        $stmt = $this->conn->prepare("SELECT 1 FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->rowCount() > 0;
    }

    public function makeAdmin($facilityId, $userId, $assignedBy) {
        $this->conn->beginTransaction();
        try {
            // Verify the assigning user has permission
            if (!$this->isFacilityOwner($facilityId, $assignedBy)) {
                throw new Exception('Only facility owner can grant admin privileges');
            }
    
            // Verify user exists
            if (!$this->userExists($userId)) {
                throw new Exception('User not found');
            }
    
            // Check if user is already admin
            $stmt = $this->conn->prepare("
                SELECT 1 FROM facility_admins 
                WHERE facility_id = ? AND user_id = ?
            ");
            $stmt->execute([$facilityId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                $this->conn->commit();
                return true; // Already an admin
            }
    
            // Verify user is a member of the facility
            $stmt = $this->conn->prepare("
                SELECT 1 FROM facility_members 
                WHERE facility_id = ? AND user_id = ?
            ");
            $stmt->execute([$facilityId, $userId]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('User is not a member of this facility');
            }
    
            // Add as admin
            $stmt = $this->conn->prepare("
                INSERT INTO facility_admins (facility_id, user_id, assigned_by) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$facilityId, $userId, $assignedBy]);
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error making admin: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function revokeAdmin($facilityId, $userId, $useTransaction = true) {
        if ($useTransaction) {
            $this->conn->beginTransaction();
        }
        try {
            // Verify the user has permission
            if (!$this->isFacilityOwner($facilityId, $_SESSION['user_id'])) {
                throw new Exception('Only facility owner can revoke admin privileges');
            }
    
            // Verify user exists
            if (!$this->userExists($userId)) {
                throw new Exception('User not found');
            }
    
            // Check if user is actually an admin
            $stmt = $this->conn->prepare("
                SELECT 1 FROM facility_admins 
                WHERE facility_id = ? AND user_id = ?
            ");
            $stmt->execute([$facilityId, $userId]);
            
            if ($stmt->rowCount() === 0) {
                if ($useTransaction) {
                    $this->conn->commit();
                }
                return true; // Not an admin, nothing to do
            }
    
            // Revoke admin
            $stmt = $this->conn->prepare("
                DELETE FROM facility_admins 
                WHERE facility_id = ? AND user_id = ?
            ");
            $success = $stmt->execute([$facilityId, $userId]);
            
            if ($useTransaction) {
                $this->conn->commit();
            }
            return $success;
            
        } catch (Exception $e) {
            if ($useTransaction) {
                $this->conn->rollBack();
            }
            error_log("Error revoking admin: " . $e->getMessage());
            throw $e;
        }
    }

    public function removeMember($facilityId, $userId) {
        $this->conn->beginTransaction();
        try {
            // Verify the removing user has permission
            if (!$this->isFacilityOwner($facilityId, $_SESSION['user_id'])) {
                throw new Exception('Only facility owner can remove members');
            }
    
            // Verify user exists
            if (!$this->userExists($userId)) {
                throw new Exception('User not found');
            }
    
            // Get facility info
            $facility = $this->getFacilityById($facilityId);
            if (!$facility) {
                throw new Exception('Facility not found');
            }
    
            // Check if user is the owner
            if ($userId == $facility['owner_id']) {
                throw new Exception('Cannot remove facility owner');
            }
    
            // First revoke admin status if they have it, without starting a new transaction
            $this->revokeAdmin($facilityId, $userId, false);
    
            // Remove from members
            $stmt = $this->conn->prepare("
                DELETE FROM facility_members 
                WHERE facility_id = ? AND user_id = ?
            ");
            $success = $stmt->execute([$facilityId, $userId]);
            
            if ($success) {
                // Only update default facility if the user has no other facilities
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM facility_members 
                    WHERE user_id = ? AND facility_id != ?
                ");
                $stmt->execute([$userId, $facilityId]);
                $otherFacilities = $stmt->fetchColumn();
                
                if ($otherFacilities == 0) {
                    // User has no other facilities, set default to NULL
                    $stmt = $this->conn->prepare("
                        UPDATE users 
                        SET default_facility_id = NULL 
                        WHERE id = ? AND default_facility_id = ?
                    ");
                    $stmt->execute([$userId, $facilityId]);
                }
                
                $this->conn->commit();
                return true;
            }
            
            $this->conn->rollBack();
            return false;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error removing member: " . $e->getMessage());
            throw $e;
        }
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

    public function getFacilityCode($facilityId) {
        $stmt = $this->conn->prepare("SELECT code FROM facilities WHERE id = ?");
        $stmt->execute([$facilityId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['code'] : null;
    }

    public function getMemberCount($facilityId) {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM facility_members WHERE facility_id = ?");
        $stmt->execute([$facilityId]);
        return $stmt->fetchColumn();
    }
    
    public function isFacilityOwner($facilityId, $userId) {
        $stmt = $this->conn->prepare("SELECT 1 FROM facilities WHERE id = ? AND owner_id = ?");
        $stmt->execute([$facilityId, $userId]);
        return $stmt->rowCount() > 0;
    }
    
    public function updateMemberCount($facilityId) {
        $count = $this->getMemberCount($facilityId);
        $stmt = $this->conn->prepare("UPDATE facilities SET member_count = ? WHERE id = ?");
        return $stmt->execute([$count, $facilityId]);
    }
}