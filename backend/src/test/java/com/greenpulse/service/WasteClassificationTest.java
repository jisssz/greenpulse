package com.greenpulse.service;

import com.greenpulse.entity.Role;
import com.greenpulse.entity.User;
import com.greenpulse.entity.WastePrediction;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

public class WasteClassificationTest {

    @Test
    public void testWastePredictionEntity() {
        User user = new User(1L, "Jane Doe", "citizen@greenpulse.demo", "hashedPassword", "+1234567893", Role.CITIZEN);
        WastePrediction prediction = new WastePrediction(
            1L,
            user,
            "http://res.cloudinary.com/demo/image/upload/v1/sample.png",
            "Plastic",
            96.4,
            true,
            "Blue Bin",
            25
        );

        assertEquals(1L, prediction.getId());
        assertEquals(user, prediction.getUser());
        assertEquals("http://res.cloudinary.com/demo/image/upload/v1/sample.png", prediction.getImageUrl());
        assertEquals("Plastic", prediction.getPredictedCategory());
        assertEquals(96.4, prediction.getConfidence());
        assertTrue(prediction.getRecyclable());
        assertEquals("Blue Bin", prediction.getRecommendedBin());
        assertEquals(25, prediction.getEcoPoints());
        assertNotNull(prediction.getCreatedAt());

        // Test setters
        prediction.setEcoPoints(50);
        assertEquals(50, prediction.getEcoPoints());
        
        prediction.setPredictedCategory("Electronic Waste");
        assertEquals("Electronic Waste", prediction.getPredictedCategory());
    }
}
