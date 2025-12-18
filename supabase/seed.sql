-- Seed Cohorts
INSERT INTO cohorts (name, type, start_date)
VALUES 
('Cohorte Alpha (Menores)', 'minor', NOW()),
('Cohorte Beta (Adultos)', 'adult', NOW());

-- Seed Challenges
INSERT INTO challenges (title, description, points, resource_url)
VALUES
('Misión 1: Identidad Digital', 'Sube una foto creativa que represente tu visión del futuro.', 50, 'https://example.com/guia1'),
('Misión 2: Entrevista Local', 'Entrevista a un líder comunitario sobre problemas del barrio.', 100, 'https://example.com/guia2'),
('Misión 3: Mapa de Activos', 'Geolocaliza 3 lugares clave para el desarrollo juvenil en tu zona.', 150, 'https://example.com/guia3');

-- Seed Opportunities (Mock)
INSERT INTO opportunities (title, description, partner_name, target_cohort_type, logo_url)
VALUES
('Beca de Programación Frontend', 'Curso intensivo de 3 meses para jóvenes.', 'TechParaTodos', 'minor', 'https://via.placeholder.com/150'),
('Pasantía en Diseño Gráfico', 'Práctica remunerada para creación de marca.', 'Agencia Creativa', 'adult', 'https://via.placeholder.com/150');
