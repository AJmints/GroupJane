package org.rally.backend.userprofilearm.repository;

import org.rally.backend.servicesarm.model.Service;
import org.springframework.data.repository.CrudRepository;

public interface ServiceRepository extends CrudRepository<Service, Integer> {
}
