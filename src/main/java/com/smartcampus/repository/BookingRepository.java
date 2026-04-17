package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate bookingDate,
                                          LocalTime startTime, LocalTime endTime);

    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);
    List<Booking> findByResourceIdAndBookingDate(String resourceId, LocalDate bookingDate);
}
