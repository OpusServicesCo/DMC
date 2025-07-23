
-- Supprimer la contrainte d'unicité qui empêche les paiements multiples pour une même facture
ALTER TABLE public.paiements DROP CONSTRAINT IF EXISTS unique_facture_payment;

-- Permettre plusieurs paiements pour la même facture
-- (pas besoin d'ajouter une nouvelle contrainte car on veut permettre les paiements partiels)
