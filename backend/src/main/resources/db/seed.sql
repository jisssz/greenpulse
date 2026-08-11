-- GreenPulse Initial Seed Data (Phase 1 + Phase 2)
-- Demo Users Password: password123

INSERT INTO users (id, name, email, password_hash, phone, role, is_active, created_at) VALUES
(1, 'System Admin', 'admin@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567890', 'ADMIN', TRUE, CURRENT_TIMESTAMP),
(2, 'Sarah Jenkins (Moderator)', 'moderator@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567891', 'MODERATOR', TRUE, CURRENT_TIMESTAMP),
(3, 'Alex Rivera (Field Worker)', 'worker@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567892', 'FIELD_WORKER', TRUE, CURRENT_TIMESTAMP),
(4, 'Jane Doe (Citizen)', 'citizen@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567893', 'CITIZEN', TRUE, CURRENT_TIMESTAMP),
(5, 'Marcus Vance (Field Worker)', 'worker2@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567894', 'FIELD_WORKER', TRUE, CURRENT_TIMESTAMP),
(6, 'Elena Rostova (Citizen)', 'citizen2@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567895', 'CITIZEN', TRUE, CURRENT_TIMESTAMP),
(7, 'Inspector Vikram Roy (Authority)', 'officer@greenpulse.demo', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY04c251x5.9gBqT/G6.G', '+1234567896', 'AUTHORITY_OFFICER', TRUE, CURRENT_TIMESTAMP);

INSERT INTO categories (id, name, description, icon_name, is_active) VALUES
(1, 'Illegal Dumping', 'Unauthorized dumping of large waste or hazardous material in open land.', 'AlertTriangle', TRUE),
(2, 'Overflowing Bin', 'Public garbage bins filled beyond capacity spreading litter.', 'Trash2', TRUE),
(3, 'Plastic Waste', 'Accumulation of non-biodegradable single-use plastics in public spaces.', 'Package', TRUE),
(4, 'Construction Waste', 'Debris, bricks, or concrete left unattended on roads or public spaces.', 'HardHat', TRUE),
(5, 'E-Waste', 'Discarded electronic equipment, wires, batteries, or appliances.', 'Cpu', TRUE),
(6, 'Open Waste Burning', 'Illegal burning of trash causing toxic smoke and air pollution.', 'Flame', TRUE),
(7, 'Public Littering', 'Scattered trash in parks, streets, or public amenities.', 'Wind', TRUE),
(8, 'Hazardous Waste', 'Chemicals, medical waste, or toxic substances posing health risks.', 'Biohazard', TRUE),
(9, 'Drainage Waste', 'Waste blocking storm drains or waterways causing urban flooding.', 'Droplets', TRUE),
(10, 'Other', 'Other civic environmental issues requiring municipal attention.', 'HelpCircle', TRUE);

INSERT INTO reports (id, report_number, title, description, category_id, citizen_id, assigned_to, latitude, longitude, address, priority, status, report_type, created_at, verified_at, resolved_at) VALUES
(1, 'GP-2026-000001', 'Severe Illegal Dumping near City Park', 'Large pile of discarded furniture, plastic drums, and household waste blocking the walking trail behind City Park.', 1, 4, 3, 37.7749, -122.4194, '100 Park Boulevard, Central District', 'HIGH', 'IN_PROGRESS', 'ILLEGAL_DUMPING', '2026-08-08 10:00:00', '2026-08-09 11:30:00', NULL),
(2, 'GP-2026-000002', 'Overflowing Bin spreading trash near Bus Station', 'Main bin at Bus Stop #4 is overflowing onto the sidewalk. Stray animals scattering trash.', 2, 4, 3, 37.7833, -122.4167, '450 Transit Avenue', 'MEDIUM', 'ASSIGNED', 'ENVIRONMENTAL_ISSUE', '2026-08-10 09:00:00', '2026-08-10 14:00:00', NULL),
(3, 'GP-2026-000003', 'Toxic Open Plastic Waste Burning behind Market', 'Commercial vendor burning plastic packaging and wire insulation creating dense noxious black smoke.', 6, 6, NULL, 37.7690, -122.4480, '820 Market Square Alley', 'CRITICAL', 'SUBMITTED', 'ILLEGAL_BURNING', '2026-08-11 08:00:00', NULL, NULL),
(4, 'GP-2026-000004', 'Construction Debris blocking Drainage Pipe', 'Concrete blocks and loose gravel dumped near storm drain inlet ahead of forecasted rain.', 9, 6, 5, 37.7550, -122.4350, '1205 South Creek Road', 'HIGH', 'RESOLVED', 'CONSTRUCTION_WASTE', '2026-08-06 08:00:00', '2026-08-07 10:00:00', '2026-08-10 16:00:00'),
(5, 'GP-2026-000005', 'Electronic Batteries & E-Waste dumped in Playground', 'Box of leaking lead-acid batteries and CRT monitor glass left in children playground area.', 5, 4, 3, 37.7600, -122.4200, '350 Sunshine Park Way', 'CRITICAL', 'CLOSED', 'HAZARDOUS_WASTE', '2026-08-04 09:00:00', '2026-08-05 10:00:00', '2026-08-08 12:00:00');

INSERT INTO evidence (id, evidence_number, report_id, source_type, submitted_by, captured_at, latitude, longitude, file_url, thumbnail_url, description, evidence_hash, verification_status, verified_by, verified_at, created_at) VALUES
(1, 'GP-EVD-2026-000001', 1, 'CITIZEN_PHOTO', 4, '2026-08-08 10:00:00', 37.7749, -122.4194, '/uploads/dumping_park.jpg', '/uploads/dumping_park.jpg', 'High-res photograph of industrial waste drums and discarded furniture', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'VERIFIED', 7, '2026-08-09 11:30:00', '2026-08-08 10:00:00'),
(2, 'GP-EVD-2026-000002', 3, 'CCTV', 7, '2026-08-11 08:00:00', 37.7690, -122.4480, '/uploads/burning_smoke.jpg', '/uploads/burning_smoke.jpg', 'Municipal CCTV Camera #42 footage showing vendor burning commercial plastics', 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2', 'VERIFIED', 7, '2026-08-11 08:30:00', '2026-08-11 08:00:00'),
(3, 'GP-EVD-2026-000003', 5, 'CITIZEN_PHOTO', 4, '2026-08-04 09:00:00', 37.7600, -122.4200, '/uploads/ewaste_playground.jpg', '/uploads/ewaste_playground.jpg', 'Citizen photo evidence of battery acid leakage in public park', 'c546a9a0f019f3900f68d601b0b72a6b29f0e0c0347895e7b2354898165c7112', 'VERIFIED', 7, '2026-08-05 10:00:00', '2026-08-04 09:00:00');

INSERT INTO reward_policies (id, name, reward_percentage, maximum_reward, minimum_fine, enabled, effective_from) VALUES
(1, 'Standard Community Environmental Incentive Policy', 10.0, 500.0, 500.0, TRUE, '2026-01-01 00:00:00');

INSERT INTO enforcement_cases (id, case_number, report_id, evidence_id, assigned_officer_id, violation_type, case_status, priority, location, opened_at, investigated_at, closed_at, created_at) VALUES
(1, 'GP-ENF-2026-000001', 1, 1, 7, 'Illegal Industrial Waste Dumping', 'FINE_ISSUED', 'HIGH', '100 Park Boulevard, Central District', '2026-08-09 11:30:00', '2026-08-09 14:00:00', NULL, '2026-08-09 11:30:00'),
(2, 'GP-ENF-2026-000002', 3, 2, 7, 'Open Toxic Waste Plastic Burning', 'UNDER_INVESTIGATION', 'CRITICAL', '820 Market Square Alley', '2026-08-11 08:30:00', NULL, NULL, '2026-08-11 08:30:00'),
(3, 'GP-ENF-2026-000003', 5, 3, 7, 'Hazardous E-Waste Contamination', 'FINE_PAID', 'CRITICAL', '350 Sunshine Park Way', '2026-08-05 10:00:00', '2026-08-05 14:00:00', '2026-08-08 15:00:00', '2026-08-05 10:00:00');

INSERT INTO offenders (id, enforcement_case_id, identity_status, identification_method, masked_reference, vehicle_reference, verification_source, verified_by, verified_at) VALUES
(1, 1, 'OFFENDER_IDENTIFIED', 'VEHICLE_LOOKUP', 'DEMO-REF-8849-XXXX', 'KA-01-EQ-9921', 'SIMULATED_AUTHORITY_ADAPTER', 7, '2026-08-09 14:00:00'),
(2, 3, 'VIOLATION_CONFIRMED', 'AUTHORIZED_GOVERNMENT_LOOKUP', 'AUTH-DEMO-2201-XXXX', 'MH-02-CP-4410', 'SIMULATED_AUTHORITY_ADAPTER', 7, '2026-08-05 14:00:00');

INSERT INTO fines (id, enforcement_case_id, challan_number, violation_type, fine_amount, currency, issued_by, issued_at, due_date, payment_status, paid_at, external_reference) VALUES
(1, 1, 'GP-CHL-2026-000001', 'Illegal Industrial Waste Dumping', 3000.0, 'INR', 7, '2026-08-09 15:00:00', '2026-08-25 00:00:00', 'PAYMENT_PENDING', NULL, 'DEMO-EXT-CHL-881'),
(2, 3, 'GP-CHL-2026-000002', 'Hazardous E-Waste Contamination', 5000.0, 'INR', 7, '2026-08-05 15:00:00', '2026-08-20 00:00:00', 'PAID', '2026-08-08 14:00:00', 'DEMO-PAY-2026-00091');

INSERT INTO rewards (id, enforcement_case_id, contributor_id, fine_id, reward_percentage, eligible_amount, approved_amount, payment_status, payment_reference, approved_at, paid_at, fraud_flag) VALUES
(1, 3, 4, 2, 10.0, 500.0, 500.0, 'PAID', 'DEMO-REWARD-2026-0011', '2026-08-08 14:30:00', '2026-08-08 15:00:00', 'NORMAL');

INSERT INTO government_verifications (id, enforcement_case_id, verification_type, provider, external_reference, verification_status, requested_at, completed_at, requested_by) VALUES
(1, 1, 'VEHICLE_REGISTRATION', 'SIMULATED_AUTHORITY_SERVICE', 'DEMO-IDV-12345', 'VERIFIED', '2026-08-09 13:50:00', '2026-08-09 14:00:00', 7),
(2, 3, 'COMMERCIAL_REGISTRATION', 'SIMULATED_AUTHORITY_SERVICE', 'DEMO-IDV-67890', 'VERIFIED', '2026-08-05 13:50:00', '2026-08-05 14:00:00', 7);

INSERT INTO report_images (id, report_id, image_url, image_type, uploaded_by, created_at) VALUES
(1, 1, '/uploads/dumping_park.jpg', 'INITIAL', 4, '2026-08-08 10:00:00'),
(2, 2, '/uploads/overflow_bin.jpg', 'INITIAL', 4, '2026-08-10 09:00:00'),
(3, 3, '/uploads/burning_smoke.jpg', 'INITIAL', 6, '2026-08-11 08:00:00'),
(4, 4, '/uploads/drain_debris.jpg', 'INITIAL', 6, '2026-08-06 08:00:00'),
(5, 4, '/uploads/drain_cleared.jpg', 'AFTER', 5, '2026-08-10 16:00:00'),
(6, 5, '/uploads/ewaste_playground.jpg', 'INITIAL', 4, '2026-08-04 09:00:00'),
(7, 5, '/uploads/ewaste_cleared.jpg', 'AFTER', 3, '2026-08-08 12:00:00');

INSERT INTO report_status_history (id, report_id, old_status, new_status, changed_by, comment, created_at) VALUES
(1, 1, NULL, 'SUBMITTED', 4, 'Report submitted by citizen', '2026-08-08 10:00:00'),
(2, 1, 'SUBMITTED', 'VERIFIED', 2, 'Verified by moderator. High hazard potential.', '2026-08-09 11:30:00'),
(3, 1, 'VERIFIED', 'IN_PROGRESS', 3, 'Field worker accepted assignment and dispatched cleanup unit.', '2026-08-10 08:00:00'),
(4, 4, 'IN_PROGRESS', 'RESOLVED', 5, 'Drainage unblocked and debris hauled away to designated recycling center.', '2026-08-10 16:00:00'),
(5, 5, 'RESOLVED', 'CLOSED', 4, 'Citizen confirmed site is clean and safe.', '2026-08-09 10:00:00');

INSERT INTO comments (id, report_id, user_id, comment, is_internal, created_at) VALUES
(1, 1, 2, 'Dispatched sanitation truck #12. Priority escalated due to park foot traffic.', TRUE, '2026-08-09 11:30:00'),
(2, 1, 3, 'Arrived at site with heavy loader team.', FALSE, '2026-08-10 08:00:00'),
(3, 4, 5, 'Completed cleanup before heavy rain expected tonight.', FALSE, '2026-08-10 16:00:00');

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 4, 'Report Verified', 'Your report GP-2026-000001 has been verified and assigned to sanitation team.', 'STATUS_UPDATE', FALSE, '2026-08-09 11:30:00'),
(2, 6, 'Verification Required', 'Your report GP-2026-000004 was marked resolved. Please confirm if issue is solved.', 'ACTION_REQUIRED', FALSE, '2026-08-10 16:00:00'),
(3, 4, 'Citizen Reward Approved!', 'Your verified contribution to case GP-ENF-2026-000003 earned a reward of ₹500.', 'REWARD', FALSE, '2026-08-08 15:00:00');

INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES
(1, 2, 'REPORT_VERIFIED', 'REPORT', 1, '{"priority":"HIGH", "category":"Illegal Dumping"}', '2026-08-09 11:30:00'),
(2, 7, 'ENFORCEMENT_CASE_CREATED', 'ENFORCEMENT_CASE', 1, '{"caseNumber":"GP-ENF-2026-000001"}', '2026-08-09 11:30:00'),
(3, 7, 'CHALLAN_ISSUED', 'FINE', 1, '{"challanNumber":"GP-CHL-2026-000001", "amount": 3000.0}', '2026-08-09 15:00:00');
