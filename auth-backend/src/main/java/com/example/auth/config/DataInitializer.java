package com.example.auth.config;

import com.example.auth.entity.*;
import com.example.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println(">>> SEEDING INITIAL REALISTIC DATA FOR RENTAL PLACE PLATFORM <<<");

        // 1. Categories
        Category catApartment = new Category();
        catApartment.setCategoryName("Apartment");
        catApartment.setDescription("Modern high-rise and mid-rise residential apartments.");
        categoryRepository.save(catApartment);

        Category catHouse = new Category();
        catHouse.setCategoryName("House");
        catHouse.setDescription("Spacious suburban and single-family houses with private yards.");
        categoryRepository.save(catHouse);

        Category catVilla = new Category();
        catVilla.setCategoryName("Villa");
        catVilla.setDescription("Exclusive luxury estates and beachfront holiday villas.");
        categoryRepository.save(catVilla);

        Category catStudio = new Category();
        catStudio.setCategoryName("Studio");
        catStudio.setDescription("Open-concept urban lofts and compact studio suites.");
        categoryRepository.save(catStudio);

        // 2. Users
        User admin = User.builder()
                .username("admin")
                .name("Platform Administrator")
                .email("admin@rentalplace.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+1 555-0100")
                .role("ADMIN")
                .roles(Set.of("ADMIN", "OWNER", "TENANT"))
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .verified(true)
                .build();
        userRepository.save(admin);

        User owner = User.builder()
                .username("sarah_owner")
                .name("Sarah Jenkins")
                .email("sarah@jenkinsrentals.com")
                .password(passwordEncoder.encode("owner123"))
                .phone("+1 555-0144")
                .role("OWNER")
                .roles(Set.of("OWNER"))
                .avatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150")
                .verified(true)
                .build();
        userRepository.save(owner);

        User agent = User.builder()
                .username("marcus_agent")
                .name("Marcus Sterling")
                .email("marcus@sterlingrealty.com")
                .password(passwordEncoder.encode("agent123"))
                .phone("+1 555-0199")
                .role("AGENT")
                .roles(Set.of("AGENT", "OWNER"))
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .verified(true)
                .build();
        userRepository.save(agent);

        User tenant = User.builder()
                .username("alex_tenant")
                .name("Alex Rivera")
                .email("alex.rivera@example.com")
                .password(passwordEncoder.encode("tenant123"))
                .phone("+1 555-0182")
                .role("TENANT")
                .roles(Set.of("TENANT"))
                .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                .verified(true)
                .build();
        userRepository.save(tenant);

        // 3. Properties
        Listing l1 = new Listing();
        l1.setTitle("Skyline Residences & Penthouse");
        l1.setDescription("Modern high-rise luxury apartment featuring floor-to-ceiling windows with breathtaking Manhattan skyline views. Includes 24/7 concierge service, private rooftop infinity pool, state-of-the-art gym, and underground reserved parking.");
        l1.setPrice(new BigDecimal("3200"));
        l1.setPriceUnit("PER_MONTH");
        l1.setDeposit(new BigDecimal("3200"));
        l1.setCleaningFee(new BigDecimal("200"));
        l1.setType("APARTMENT");
        l1.setCategory(catApartment);
        l1.setAddress("450 Lexington Avenue");
        l1.setCity("New York");
        l1.setState("NY");
        l1.setCountry("USA");
        l1.setZipCode("10017");
        l1.setLocation("Downtown, New York");
        l1.setBeds(2);
        l1.setBaths(2);
        l1.setAreaSqFt(1250);
        l1.setFurnished(true);
        l1.setAmenities("WiFi, Air Conditioning, Heating, Kitchen, Rooftop Pool, Gym, Elevator, Dishwasher, Concierge");
        l1.setHouseRules("No smoking, Pets allowed upon prior approval, Quiet hours 10 PM - 7 AM.");
        l1.setImageUrl("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l1.setImages("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800,https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800,https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800");
        l1.setTags("Luxury, Downtown, Skyline, Rooftop");
        l1.setStatus("PUBLISHED");
        l1.setAvailabilityStatus("AVAILABLE");
        l1.setRating(4.8);
        l1.setReviewCount(12);
        l1.setVerified(true);
        l1.setFeatured(true);
        l1.setOwner(owner);
        listingRepository.save(l1);

        Listing l2 = new Listing();
        l2.setTitle("Blue Horizon Tower Suite");
        l2.setDescription("Architect-designed high-floor suite overlooking Millennium Park and Lake Michigan. Features European oak flooring, Italian quartz countertops, integrated smart home climate control, and sub-zero appliances.");
        l2.setPrice(new BigDecimal("2750"));
        l2.setPriceUnit("PER_MONTH");
        l2.setDeposit(new BigDecimal("2000"));
        l2.setType("APARTMENT");
        l2.setCategory(catApartment);
        l2.setAddress("200 N Michigan Ave");
        l2.setCity("Chicago");
        l2.setState("IL");
        l2.setCountry("USA");
        l2.setZipCode("60601");
        l2.setLocation("Midtown, Chicago");
        l2.setBeds(1);
        l2.setBaths(1);
        l2.setAreaSqFt(850);
        l2.setFurnished(true);
        l2.setAmenities("WiFi, Air Conditioning, Balcony, Fitness Center, Doorman, Washer/Dryer, Wine Cooler");
        l2.setHouseRules("Non-smoking building, Maximum 2 occupants.");
        l2.setImageUrl("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l2.setImages("https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800,https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800");
        l2.setTags("Lake View, Modern, Smart Home");
        l2.setStatus("PUBLISHED");
        l2.setAvailabilityStatus("AVAILABLE");
        l2.setRating(4.6);
        l2.setReviewCount(8);
        l2.setVerified(true);
        l2.setOwner(agent);
        listingRepository.save(l2);

        Listing l3 = new Listing();
        l3.setTitle("Maple Grove Colonial Estate");
        l3.setDescription("Charming 4-bedroom colonial home situated on half an acre of manicured grounds surrounded by mature autumn trees. Includes a chef's kitchen, custom stone fireplace, cedar deck, heated 2-car garage, and finished basement lounge.");
        l3.setPrice(new BigDecimal("4500"));
        l3.setPriceUnit("PER_MONTH");
        l3.setDeposit(new BigDecimal("4500"));
        l3.setType("HOUSE");
        l3.setCategory(catHouse);
        l3.setAddress("74 Brookside Lane");
        l3.setCity("Boston");
        l3.setState("MA");
        l3.setCountry("USA");
        l3.setZipCode("02138");
        l3.setLocation("Brookside, Boston");
        l3.setBeds(4);
        l3.setBaths(3);
        l3.setAreaSqFt(2800);
        l3.setFurnished(true);
        l3.setAmenities("WiFi, Fireplace, Garden/Backyard, Garage, Washer/Dryer, Central Heating, Patio, Pet Friendly");
        l3.setHouseRules("Family-friendly neighborhood, Pets welcome with deposit.");
        l3.setImageUrl("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l3.setImages("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800");
        l3.setTags("Suburban, Garden, Family, Fireplace");
        l3.setStatus("PUBLISHED");
        l3.setAvailabilityStatus("AVAILABLE");
        l3.setRating(4.9);
        l3.setReviewCount(15);
        l3.setVerified(true);
        l3.setFeatured(true);
        l3.setOwner(owner);
        listingRepository.save(l3);

        Listing l4 = new Listing();
        l4.setTitle("Greenwood Evergreen Villa");
        l4.setDescription("Spacious modern craftsman nestled against lush evergreen groves. Features high vaulted timber ceilings, expansive cedar sun deck, gas fire pit, and proximity to top-ranked schools and tech campuses.");
        l4.setPrice(new BigDecimal("3900"));
        l4.setPriceUnit("PER_MONTH");
        l4.setDeposit(new BigDecimal("3500"));
        l4.setType("HOUSE");
        l4.setCategory(catHouse);
        l4.setAddress("1288 Pinecrest Way");
        l4.setCity("Seattle");
        l4.setState("WA");
        l4.setCountry("USA");
        l4.setZipCode("98103");
        l4.setLocation("Westfield, Seattle");
        l4.setBeds(3);
        l4.setBaths(2);
        l4.setAreaSqFt(2100);
        l4.setFurnished(false);
        l4.setAmenities("WiFi, EV Charger, Solar Panels, Backyard, Double Garage, Heating, Hardwood Floors");
        l4.setHouseRules("No smoking on premises.");
        l4.setImageUrl("https://images.unsplash.com/photo-1600585154526-990dced4db0d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l4.setTags("Eco-friendly, Solar, EV Charger, Seattle");
        l4.setStatus("PUBLISHED");
        l4.setAvailabilityStatus("AVAILABLE");
        l4.setRating(4.5);
        l4.setReviewCount(6);
        l4.setVerified(true);
        l4.setOwner(owner);
        listingRepository.save(l4);

        Listing l5 = new Listing();
        l5.setTitle("Azure Palm Beachfront Villa");
        l5.setDescription("Ultra-exclusive beachfront sanctuary with direct private boardwalk to the ocean. Boasts an infinity-edge saltwater pool, outdoor cabana, summer kitchen, marble master bath with soaking tub, and floor-to-ceiling glass pavilions.");
        l5.setPrice(new BigDecimal("12000"));
        l5.setPriceUnit("PER_MONTH");
        l5.setDeposit(new BigDecimal("10000"));
        l5.setType("VILLA");
        l5.setCategory(catVilla);
        l5.setAddress("10 Ocean Drive");
        l5.setCity("Miami");
        l5.setState("FL");
        l5.setCountry("USA");
        l5.setZipCode("33139");
        l5.setLocation("Beachfront, Miami");
        l5.setBeds(5);
        l5.setBaths(4);
        l5.setAreaSqFt(4600);
        l5.setFurnished(true);
        l5.setAmenities("Private Pool, Beach Access, Hot Tub, Outdoor Kitchen, Security System, Ocean View, Butler Service");
        l5.setHouseRules("No large parties without prior written arrangement.");
        l5.setImageUrl("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l5.setImages("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800,https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800");
        l5.setTags("Oceanfront, Private Pool, Luxury, Miami");
        l5.setStatus("PUBLISHED");
        l5.setAvailabilityStatus("AVAILABLE");
        l5.setRating(5.0);
        l5.setReviewCount(19);
        l5.setVerified(true);
        l5.setFeatured(true);
        l5.setOwner(agent);
        listingRepository.save(l5);

        Listing l6 = new Listing();
        l6.setTitle("SoHo Industrial Designer Loft");
        l6.setDescription("Iconic Cast Iron district artist loft with original 14-foot tin ceilings, exposed brick walls, museum-quality track lighting, bespoke Italian minimalist kitchen, and oversized soundproof windows.");
        l6.setPrice(new BigDecimal("1850"));
        l6.setPriceUnit("PER_MONTH");
        l6.setDeposit(new BigDecimal("1850"));
        l6.setType("STUDIO");
        l6.setCategory(catStudio);
        l6.setAddress("98 Mercer Street");
        l6.setCity("New York");
        l6.setState("NY");
        l6.setCountry("USA");
        l6.setZipCode("10012");
        l6.setLocation("SoHo, New York");
        l6.setBeds(1);
        l6.setBaths(1);
        l6.setAreaSqFt(650);
        l6.setFurnished(true);
        l6.setAmenities("WiFi, Designer Kitchen, High Ceilings, Laundry in Building, Elevator, Historic Building");
        l6.setHouseRules("Quiet residential building.");
        l6.setImageUrl("https://images.unsplash.com/photo-1536376072261-38c75010e6c9?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l6.setTags("SoHo, Industrial, Loft, Artist Studio");
        l6.setStatus("PUBLISHED");
        l6.setAvailabilityStatus("AVAILABLE");
        l6.setRating(4.7);
        l6.setReviewCount(10);
        l6.setVerified(true);
        l6.setOwner(owner);
        listingRepository.save(l6);

        Listing l7 = new Listing();
        l7.setTitle("Villa Bellagio Panoramic Estate");
        l7.setDescription("Tuscan-inspired hillside estate featuring 180-degree canyon views, lush olive orchards, zero-edge pool, private tennis court, wine cellar, and gated motor court.");
        l7.setPrice(new BigDecimal("15500"));
        l7.setPriceUnit("PER_MONTH");
        l7.setDeposit(new BigDecimal("15000"));
        l7.setType("VILLA");
        l7.setCategory(catVilla);
        l7.setAddress("1400 Benedict Canyon Drive");
        l7.setCity("Los Angeles");
        l7.setState("CA");
        l7.setCountry("USA");
        l7.setZipCode("90210");
        l7.setLocation("Beverly Hills, Los Angeles");
        l7.setBeds(6);
        l7.setBaths(5);
        l7.setAreaSqFt(5800);
        l7.setFurnished(true);
        l7.setAmenities("Infinity Pool, Tennis Court, Wine Cellar, Canyon Views, Gated Security, Smart Home");
        l7.setHouseRules("Long-term tenancy preferred, strict privacy standards.");
        l7.setImageUrl("https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l7.setTags("Beverly Hills, Tennis Court, Luxury, Views");
        l7.setStatus("PUBLISHED");
        l7.setAvailabilityStatus("AVAILABLE");
        l7.setRating(4.9);
        l7.setReviewCount(14);
        l7.setVerified(true);
        l7.setOwner(agent);
        listingRepository.save(l7);

        Listing l8 = new Listing();
        l8.setTitle("Uptown Eco Garden Residences");
        l8.setDescription("Sun-drenched south-facing apartment overlooking Austin's Lady Bird Lake trail. Features bamboo flooring, private terrace with vertical herb garden, energy star appliances, and community co-working lounge.");
        l8.setPrice(new BigDecimal("2100"));
        l8.setPriceUnit("PER_MONTH");
        l8.setDeposit(new BigDecimal("1500"));
        l8.setType("APARTMENT");
        l8.setCategory(catApartment);
        l8.setAddress("310 Riverside Drive");
        l8.setCity("Austin");
        l8.setState("TX");
        l8.setCountry("USA");
        l8.setZipCode("78704");
        l8.setLocation("Uptown, Austin");
        l8.setBeds(2);
        l8.setBaths(1);
        l8.setAreaSqFt(950);
        l8.setFurnished(true);
        l8.setAmenities("WiFi, Co-working Lounge, Dog Park, Rooftop Deck, Bike Storage, Swimming Pool");
        l8.setHouseRules("Pet friendly, 2 pets maximum.");
        l8.setImageUrl("https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200");
        l8.setTags("Austin, Eco-Friendly, Dog Friendly, Balcony");
        l8.setStatus("PUBLISHED");
        l8.setAvailabilityStatus("AVAILABLE");
        l8.setRating(4.6);
        l8.setReviewCount(7);
        l8.setVerified(true);
        l8.setOwner(owner);
        listingRepository.save(l8);

        // 4. Sample Reviews
        Review r1 = new Review();
        r1.setListing(l1);
        r1.setUser(tenant);
        r1.setRating(5);
        r1.setComment("Staying at Skyline Residences exceeded all expectations! The view at sunset is magical, and the concierge team is world-class.");
        r1.setVerifiedRental(true);
        reviewRepository.save(r1);

        Review r2 = new Review();
        r2.setListing(l3);
        r2.setUser(tenant);
        r2.setRating(5);
        r2.setComment("Maple Grove was the perfect family home. Quiet street, fantastic school district, and the fireplace kept us cozy all winter.");
        r2.setVerifiedRental(true);
        reviewRepository.save(r2);

        // 5. Sample Bookings & Payments
        Booking b1 = new Booking();
        b1.setListing(l1);
        b1.setUser(tenant);
        b1.setStartDate(LocalDate.now().plusDays(10));
        b1.setEndDate(LocalDate.now().plusDays(40));
        b1.setGuestsCount(2);
        b1.setSpecialRequests("Late arrival around 8 PM, please notify building security.");
        b1.setTotalPrice(new BigDecimal("3200"));
        b1.setBookingStatus("CONFIRMED");
        bookingRepository.save(b1);

        Payment p1 = new Payment();
        p1.setBooking(b1);
        p1.setPayer(tenant);
        p1.setAmount(new BigDecimal("3200"));
        p1.setCurrency("USD");
        p1.setPaymentMethod("STRIPE_DEMO");
        p1.setPaymentStatus("SUCCESSFUL");
        p1.setTransactionId("txn_demo_init_94821");
        p1.setReceiptNumber("RCP-782910");
        p1.setPaidAt(LocalDateTime.now().minusDays(1));
        paymentRepository.save(p1);

        // 6. Sample Reminders
        Reminder rem1 = new Reminder();
        rem1.setTitle("Quarterly HVAC Inspection");
        rem1.setMessageText("Certified technician scheduled to inspect filters and condenser unit on 450 Lexington Ave.");
        rem1.setReminderType("INSPECTION");
        rem1.setDueAt(LocalDateTime.now().plusDays(5));
        rem1.setStatus("PENDING");
        rem1.setListing(l1);
        rem1.setReceiver(owner);
        rem1.setSender(owner);
        reminderRepository.save(rem1);

        Reminder rem2 = new Reminder();
        rem2.setTitle("Tenant Move-in Walkthrough");
        rem2.setMessageText("Perform key handover and digital condition report with Alex Rivera.");
        rem2.setReminderType("VIEWING");
        rem2.setDueAt(LocalDateTime.now().plusDays(10));
        rem2.setStatus("PENDING");
        rem2.setListing(l1);
        rem2.setReceiver(owner);
        rem2.setSender(owner);
        reminderRepository.save(rem2);

        System.out.println(">>> SEEDING COMPLETE: 4 Users, 4 Categories, 8 Properties, Reviews, Bookings, Payments, Reminders <<<");
    }
}
