import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Tour } from "./models/Tour.model.js";
import { Hotel } from "./models/Hotel.model.js";
import { Feedback } from "./models/Feedback.model.js";
import { DB_NAME } from "./constant.js";

const seedData = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB for seeding");

    await Tour.deleteMany({});
    await Hotel.deleteMany({});
    await Feedback.deleteMany({});

    const tours = [
      {
        name: "Skardu & Shigar Discovery",
        description: "Experience the heart of Baltistan. Visit the majestic Shigar Fort, the serene Upper Kachura Lake, and the iconic Shangrila Resort.",
        price: 50000,
        duration: "5 Days",
        location: "Skardu",
        imageUrl: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=1000&auto=format&fit=crop",
        plan: [
          "Day 1: Arrival in Skardu, check-in to hotel and visit Skardu Bazaar.",
          "Day 2: Drive to Shangrila Resort and Upper Kachura Lake for boating and relaxation.",
          "Day 3: Explore Shigar Valley, visit the 400-year-old Shigar Fort and the Blind Lake.",
          "Day 4: Visit Sadpara Lake and the Manthal Buddha Rock.",
          "Day 5: Transfer to airport for departure."
        ]
      },
      {
        name: "Deosai Plains & Khaplu Tour",
        description: "Journey to the 'Land of Giants' - the Deosai National Park, followed by a cultural retreat in the historic town of Khaplu.",
        price: 65000,
        duration: "6 Days",
        location: "Baltistan",
        imageUrl: "https://images.unsplash.com/photo-1594144349187-54848035f56b?q=80&w=1000&auto=format&fit=crop",
        plan: [
          "Day 1: Arrival in Skardu and local sightseeing.",
          "Day 2: Full day excursion to Deosai Plains, visit Sheosar Lake.",
          "Day 3: Drive to Khaplu Valley, visit Chaqchan Mosque.",
          "Day 4: Explore Khaplu Fort and the surrounding organic village.",
          "Day 5: Return to Skardu via the scenic Indus River route.",
          "Day 6: Departure from Skardu."
        ]
      },
      {
        name: "Basho Valley Camping Experience",
        description: "Escape to the lush green meadows of Basho Valley. A perfect tour for nature lovers and camping enthusiasts.",
        price: 40000,
        duration: "4 Days",
        location: "Skardu",
        imageUrl: "https://images.unsplash.com/photo-1533587144136-a092c44423e5?q=80&w=1000&auto=format&fit=crop",
        plan: [
          "Day 1: Arrival in Skardu and drive to Basho Valley.",
          "Day 2: Trek to the upper meadows of Basho, bonfire night.",
          "Day 3: Explore the pine forests and waterfalls of Basho.",
          "Day 4: Return to Skardu and departure."
        ]
      },
      {
        name: "Katpana Cold Desert Safari",
        description: "Witness the unique sight of sand dunes surrounded by snow-capped mountains. Includes a jeep safari and cultural dinner.",
        price: 30000,
        duration: "3 Days",
        location: "Skardu",
        imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
        plan: [
          "Day 1: Arrival and visit to Katpana Desert for sunset.",
          "Day 2: Jeep safari through the dunes, visit nearby Kharpocho Fort.",
          "Day 3: Local shopping and departure."
        ]
      }
    ];

    const hotels = [
      {
        name: "Shangrila Resort Skardu",
        description: "The most iconic resort in Pakistan, built around the heart-shaped Lower Kachura Lake.",
        pricePerNight: 28000,
        location: "Skardu",
        amenities: ["Lake View", "WiFi", "Fine Dining", "Boating"],
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop"
      },
      {
        name: "Serena Shigar Fort",
        description: "A 400-year-old fort converted into a luxury heritage hotel. Experience royalty in the heart of Shigar.",
        pricePerNight: 22000,
        location: "Shigar",
        amenities: ["Heritage Suite", "Organic Garden", "Traditional Dining", "Museum"],
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop"
      },
      {
        name: "Hotel One Skardu",
        description: "Modern comfort with stunning views of the Indus River and the surrounding mountains.",
        pricePerNight: 12000,
        location: "Skardu",
        amenities: ["River View", "Modern Rooms", "Restaurant", "Parking"],
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop"
      },
      {
        name: "Khaplu Palace by Serena",
        description: "An architectural masterpiece in Khaplu, offering a serene stay in a historic royal palace.",
        pricePerNight: 20000,
        location: "Khaplu",
        amenities: ["Palace Gardens", "Library", "Terrace Dining", "Cultural Tours"],
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop"
      }
    ];

    const feedbacks = [
      {
        customerName: "Ahmed Khan",
        comment: "Baltistan Tourism Club made our trip to Skardu unforgettable. The local guides were experts and the hotels were top-notch!",
        rating: 5,
        location: "Islamabad, Pakistan",
        imageUrl: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        customerName: "Sarah Miller",
        comment: "I never knew Baltistan was this beautiful. The Deosai plains tour was surreal. Everything was perfectly organized.",
        rating: 5,
        location: "London, UK",
        imageUrl: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      {
        customerName: "Zahid Ali",
        comment: "Affordable and professional. They handled all the jeep rentals and hotel bookings seamlessly. Highly recommended!",
        rating: 4,
        location: "Karachi, Pakistan",
        imageUrl: "https://randomuser.me/api/portraits/men/3.jpg"
      }
    ];

    await Tour.insertMany(tours);
    await Hotel.insertMany(hotels);
    await Feedback.insertMany(feedbacks);

    console.log("Data seeded successfully with Skardu plans and feedback!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
