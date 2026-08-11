package com.greenpulse.service.integration;

import com.greenpulse.dto.GovernmentVerificationDTOs.MockVerificationResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MockGovernmentIntegrationService implements GovernmentIntegrationService {

    @Override
    public MockVerificationResponse verifyVehicleOrIdentity(String verificationType, String queryReference) {
        String refCode = "AUTH-DEMO-" + Math.abs(queryReference != null ? queryReference.hashCode() % 10000 : 1000);
        String maskedId = "DEMO-REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-XXXX";
        
        return new MockVerificationResponse(
            "VERIFIED",
            "DEMO / SIMULATED GOVERNMENT INTEGRATION",
            refCode,
            maskedId,
            "DEMO MODE ONLY: Simulated authority verification result. Real implementation requires authorized government endpoint integration."
        );
    }
}
