-- Ajouter le champ 'lu' pour marquer les notifications comme lues
ALTER TABLE notifications 
ADD COLUMN lu BOOLEAN DEFAULT FALSE;

-- Créer un index pour optimiser les requêtes de notifications non lues
CREATE INDEX idx_notifications_lu ON notifications(lu);

-- Créer un index composé pour optimiser les requêtes par utilisateur
CREATE INDEX idx_notifications_user_lu ON notifications(medecin_id, secretaire_id, lu);

-- Commentaire pour la colonne
COMMENT ON COLUMN notifications.lu IS 'Indique si la notification a été lue par l''utilisateur';
