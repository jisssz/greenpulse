package com.greenpulse.service.integration;

import com.greenpulse.dto.GovernmentVerificationDTOs.MockVerificationResponse;

public interface GovernmentIntegrationService {
    MockVerificationResponse verifyVehicleOrIdentity(String verificationType, String queryReference);
}
