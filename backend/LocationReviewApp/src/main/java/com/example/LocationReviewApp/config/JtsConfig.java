package com.example.LocationReviewApp.config;

import org.n52.jackson.datatype.jts.JtsModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Registers the JTS module with Jackson so that PostGIS Point objects
// are serialized as proper GeoJSON instead of raw Java objects
@Configuration
public class JtsConfig {

    @Bean
    public JtsModule jtsModule() {
        return new JtsModule();
    }
}