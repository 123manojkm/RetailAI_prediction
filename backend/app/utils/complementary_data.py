"""
Comprehensive Real-World E-Commerce Product Catalog with Complementary Associations and Customer Reviews.
All prices formatted in Indian Rupees (INR ₹).

Covers:
- Laptops -> Mouse, Keyboard, Mousepad, Laptop Stand, USB-C Dock, Laptop Sleeve
- Gaming Laptop -> Gaming Mouse, Mechanical RGB Keyboard, Gaming Mousepad, Cooling Pad
- Smartphones -> Shockproof Case, Screen Protector, 45W Fast Charger, ANC Wireless Earbuds
- Digital Cameras -> 128GB High-Speed SD Card, Camera Tripod, Dual Battery Pack, Padded Bag
- Smart 4K TVs -> Wall Mount Bracket, 8K HDMI 2.1 Cable, Dolby Atmos Soundbar, Surge Protector
- Espresso Machines -> Artisan Coffee Beans, Milk Frothing Pitcher, Calibrated Tamper, Descaling Solution
"""

COMPLEMENTARY_CATALOG = {
    # ─── 1. LAPTOPS ─────────────────────────────────────────────────────────────
    "PROD-LAPTOP-01": {
        "product_id": "PROD-LAPTOP-01",
        "product_name": "ProBook Ultra 15.6\" Performance Laptop (Intel i7, 16GB RAM, 512GB SSD)",
        "category": "Computers & Laptops",
        "unit_price": 64999.00,  # ₹64,999
        "rating": 4.8,
        "review_count": 5420,
        "description": "High-performance laptop engineered for productivity, coding, and multitasking with crisp FHD anti-glare display.",
        "accessories": [
            {
                "accessory_id": "ACC-MOUSE-01",
                "product_name": "Ergonomic Silent Wireless Optical Mouse",
                "category": "Computer Accessories",
                "unit_price": 999.00,  # ₹999
                "rating": 4.8,
                "review_count": 14250,
                "co_purchase_rate": 92.4,  # 92% of laptop buyers buy this
                "requirement_type": "Essential Accessory",
                "compatibility": "100% Plug & Play (USB + Bluetooth 5.0)",
                "review_quote": "A must-have for the laptop! The silent click and thumb rest make working 8 hours a day completely painless.",
                "reviewer_name": "David M. (Verified Buyer)",
                "helpful_votes": 342,
            },
            {
                "accessory_id": "ACC-KEYBOARD-01",
                "product_name": "Slim Multi-Device Bluetooth Mechanical Keyboard",
                "category": "Computer Accessories",
                "unit_price": 2499.00,  # ₹2,499
                "rating": 4.7,
                "review_count": 8940,
                "co_purchase_rate": 84.1,
                "requirement_type": "Recommended Setup",
                "compatibility": "Compatible with Windows, macOS, Linux",
                "review_quote": "Pairs seamlessly with the laptop. Tactile switches feel amazing and battery lasts for months.",
                "reviewer_name": "Sarah K. (Software Engineer)",
                "helpful_votes": 512,
            },
            {
                "accessory_id": "ACC-MOUSEPAD-01",
                "product_name": "Extended Anti-Fray Waterproof Desk Mousepad (900x400mm)",
                "category": "Computer Accessories",
                "unit_price": 499.00,  # ₹499
                "rating": 4.9,
                "review_count": 21300,
                "co_purchase_rate": 88.7,
                "requirement_type": "Essential Desk Mat",
                "compatibility": "Universal Desk Fit with Non-Slip Rubber Base",
                "review_quote": "Fits my laptop, keyboard, and mouse with room to spare. Liquids wipe right off!",
                "reviewer_name": "Alex R. (Verified Buyer)",
                "helpful_votes": 680,
            },
            {
                "accessory_id": "ACC-STAND-01",
                "product_name": "Aluminum Ergonomic Adjustable Laptop Cooling Stand",
                "category": "Computer Accessories",
                "unit_price": 1299.00,  # ₹1,299
                "rating": 4.8,
                "review_count": 6720,
                "co_purchase_rate": 78.5,
                "requirement_type": "Ergonomic Add-on",
                "compatibility": "Supports laptops from 10\" to 17.3\"",
                "review_quote": "Fixed my neck pain within 2 days of using this stand with my laptop.",
                "reviewer_name": "Elena P. (UX Designer)",
                "helpful_votes": 215,
            },
            {
                "accessory_id": "ACC-HUB-01",
                "product_name": "7-in-1 USB-C Multiport Docking Hub (4K HDMI, 100W PD)",
                "category": "Computer Accessories",
                "unit_price": 1899.00,  # ₹1,899
                "rating": 4.6,
                "review_count": 9150,
                "co_purchase_rate": 74.2,
                "requirement_type": "Connectivity Hub",
                "compatibility": "Full USB-C Thunderbolt 3/4 Support",
                "review_quote": "Turns the laptop into a full desktop workstation with dual monitors and external drives.",
                "reviewer_name": "Marcus L. (Data Analyst)",
                "helpful_votes": 188,
            },
            {
                "accessory_id": "ACC-SLEEVE-01",
                "product_name": "Water-Resistant Shockproof 15.6\" Laptop Sleeve Case",
                "category": "Computer Accessories",
                "unit_price": 799.00,  # ₹799
                "rating": 4.7,
                "review_count": 11800,
                "co_purchase_rate": 81.0,
                "requirement_type": "Protection",
                "compatibility": "Snug fit for 15-15.6 inch laptops",
                "review_quote": "Thick velvet padding inside protects my laptop during daily train commutes.",
                "reviewer_name": "Rachel B. (Student)",
                "helpful_votes": 95,
            },
        ],
    },

    # ─── 2. GAMING LAPTOP ───────────────────────────────────────────────────────
    "PROD-LAPTOP-02": {
        "product_id": "PROD-LAPTOP-02",
        "product_name": "Apex Predator 16\" QHD Gaming Laptop (RTX 4070, 32GB RAM, 1TB SSD)",
        "category": "Computers & Laptops",
        "unit_price": 114999.00,  # ₹1,14,999
        "rating": 4.9,
        "review_count": 3810,
        "description": "Extreme gaming notebook featuring 240Hz refresh rate, RGB keyboard and dedicated GPU cooling.",
        "accessories": [
            {
                "accessory_id": "ACC-GMOUSE-01",
                "product_name": "Ultra-Lightweight 26K DPI RGB Gaming Mouse",
                "category": "Computer Accessories",
                "unit_price": 2499.00,  # ₹2,499
                "rating": 4.8,
                "review_count": 17400,
                "co_purchase_rate": 95.1,
                "requirement_type": "Essential Accessory",
                "compatibility": "Zero latency 1ms wireless + braided cable",
                "review_quote": "The trackpad is useless for FPS games; this mouse paired with the laptop is unbeatable.",
                "reviewer_name": "Tyler G. (Esports Gamer)",
                "helpful_votes": 810,
            },
            {
                "accessory_id": "ACC-GKEY-01",
                "product_name": "Tenkeyless Hot-Swappable Mechanical RGB Keyboard",
                "category": "Computer Accessories",
                "unit_price": 4499.00,  # ₹4,499
                "rating": 4.9,
                "review_count": 12600,
                "co_purchase_rate": 86.4,
                "requirement_type": "Recommended Setup",
                "compatibility": "Customizable Red linear switches",
                "review_quote": "Saves desk space next to the gaming laptop and the mechanical feedback is crisp.",
                "reviewer_name": "Chris W. (Twitch Streamer)",
                "helpful_votes": 420,
            },
            {
                "accessory_id": "ACC-MOUSEPAD-02",
                "product_name": "Speed Edition Heavy Stitched Gaming Mousepad",
                "category": "Computer Accessories",
                "unit_price": 899.00,  # ₹899
                "rating": 4.9,
                "review_count": 15800,
                "co_purchase_rate": 91.3,
                "requirement_type": "Essential Desk Mat",
                "compatibility": "Micro-woven cloth surface optimized for high DPI",
                "review_quote": "Silky smooth glide for competitive gaming. Best buy for my laptop.",
                "reviewer_name": "Kevin T. (Verified Buyer)",
                "helpful_votes": 315,
            },
            {
                "accessory_id": "ACC-COOLER-01",
                "product_name": "Dual-Fan High-Airflow Laptop Cooling Pad",
                "category": "Computer Accessories",
                "unit_price": 1799.00,  # ₹1,799
                "rating": 4.6,
                "review_count": 5210,
                "co_purchase_rate": 79.8,
                "requirement_type": "Thermal Protection",
                "compatibility": "Drops internal GPU temps by 8-12°C",
                "review_quote": "Keeps the RTX 4070 cool during 4-hour gaming sessions without loud noise.",
                "reviewer_name": "Nate D. (Hardware Enthusiast)",
                "helpful_votes": 190,
            },
        ],
    },

    # ─── 3. SMARTPHONE ──────────────────────────────────────────────────────────
    "PROD-PHONE-01": {
        "product_id": "PROD-PHONE-01",
        "product_name": "Galaxy Ultra Pro 5G Smartphone (256GB, 200MP Camera)",
        "category": "Smartphones & Mobile",
        "unit_price": 49999.00,  # ₹49,999
        "rating": 4.7,
        "review_count": 8920,
        "description": "Flagship 5G smartphone with Dynamic AMOLED 2X display, S-Pen stylus and all-day battery.",
        "accessories": [
            {
                "accessory_id": "ACC-CASE-01",
                "product_name": "Military-Grade Shockproof Armor Protective Phone Case",
                "category": "Mobile Accessories",
                "unit_price": 699.00,  # ₹699
                "rating": 4.8,
                "review_count": 32400,
                "co_purchase_rate": 96.5,
                "requirement_type": "Essential Protection",
                "compatibility": "Precise cutouts for camera and stylus port",
                "review_quote": "Dropped my phone on concrete the first week; not a single scratch. Don't buy the phone without this case!",
                "reviewer_name": "Michael S. (Verified Buyer)",
                "helpful_votes": 1240,
            },
            {
                "accessory_id": "ACC-GLASS-01",
                "product_name": "9H Hardness Tempered Glass Screen Protector (2-Pack)",
                "category": "Mobile Accessories",
                "unit_price": 349.00,  # ₹349
                "rating": 4.7,
                "review_count": 28900,
                "co_purchase_rate": 93.2,
                "requirement_type": "Essential Protection",
                "compatibility": "Fingerprint unlock sensor certified",
                "review_quote": "Easy alignment frame included. Bubble-free and ultrasonic fingerprint reader works 100%.",
                "reviewer_name": "Jessica T. (Verified Buyer)",
                "helpful_votes": 890,
            },
            {
                "accessory_id": "ACC-CHARGER-01",
                "product_name": "45W GaN Super Fast USB-C Wall Charger with 6ft Cable",
                "category": "Mobile Accessories",
                "unit_price": 1499.00,  # ₹1,499
                "rating": 4.9,
                "review_count": 19400,
                "co_purchase_rate": 87.5,
                "requirement_type": "Power Accessory",
                "compatibility": "PD 3.0 PPS 45W Fast Charging",
                "review_quote": "Phones don't come with chargers in the box anymore; this charges from 0 to 70% in 30 minutes.",
                "reviewer_name": "Brian O. (Verified Buyer)",
                "helpful_votes": 612,
            },
            {
                "accessory_id": "ACC-EARBUDS-01",
                "product_name": "Active Noise Cancelling Wireless Bluetooth Earbuds",
                "category": "Mobile Accessories",
                "unit_price": 2999.00,  # ₹2,999
                "rating": 4.8,
                "review_count": 14200,
                "co_purchase_rate": 76.1,
                "requirement_type": "Audio Add-on",
                "compatibility": "Instant one-tap Bluetooth pairing",
                "review_quote": "The noise cancelling is incredible for calls and commutes. Pairs seamlessly with the smartphone.",
                "reviewer_name": "Amanda C. (Daily Commuter)",
                "helpful_votes": 340,
            },
        ],
    },

    # ─── 4. DIGITAL CAMERA ──────────────────────────────────────────────────────
    "PROD-CAM-01": {
        "product_id": "PROD-CAM-01",
        "product_name": "Lumix Alpha Mirrorless 4K Digital Camera with 18-55mm Lens Kit",
        "category": "Cameras & Photography",
        "unit_price": 54999.00,  # ₹54,999
        "rating": 4.8,
        "review_count": 2180,
        "description": "24.2MP full-frame mirrorless camera with 4K60p video capture, in-body stabilization, and dual native ISO.",
        "accessories": [
            {
                "accessory_id": "ACC-SDCARD-01",
                "product_name": "SanDisk Extreme Pro 128GB V30 4K High-Speed SD Card",
                "category": "Camera Accessories",
                "unit_price": 1499.00,  # ₹1,499
                "rating": 4.9,
                "review_count": 45100,
                "co_purchase_rate": 97.2,
                "requirement_type": "Required to Operate",
                "compatibility": "UHS-I U3 Class 10 (200MB/s Read)",
                "review_quote": "The camera doesn't include storage; you literally cannot shoot without this. High write speed is essential for 4K video.",
                "reviewer_name": "Robert H. (Photographer)",
                "helpful_votes": 1520,
            },
            {
                "accessory_id": "ACC-TRIPOD-01",
                "product_name": "64\" Lightweight Aluminum Camera Tripod with Ball Head",
                "category": "Camera Accessories",
                "unit_price": 2199.00,  # ₹2,199
                "rating": 4.7,
                "review_count": 8700,
                "co_purchase_rate": 81.5,
                "requirement_type": "Recommended Gear",
                "compatibility": "Standard 1/4\" quick release plate",
                "review_quote": "Sturdy enough for long exposure shots and light enough to hike with. Essential with this camera.",
                "reviewer_name": "Lisa N. (Landscape Hobbyist)",
                "helpful_votes": 310,
            },
            {
                "accessory_id": "ACC-BATTERY-01",
                "product_name": "Dual Battery Pack & Dual Slot Rapid USB Charger",
                "category": "Camera Accessories",
                "unit_price": 1899.00,  # ₹1,899
                "rating": 4.8,
                "review_count": 6400,
                "co_purchase_rate": 89.0,
                "requirement_type": "Essential Power",
                "compatibility": "Exact replacement for OEM battery series",
                "review_quote": "Mirrorless cameras eat batteries fast. Having two extra batteries and a dual charger saved my shoots.",
                "reviewer_name": "Carlos M. (Event Videographer)",
                "helpful_votes": 485,
            },
            {
                "accessory_id": "ACC-BAG-01",
                "product_name": "Waterproof Padded Camera Shoulder Bag with Rain Cover",
                "category": "Camera Accessories",
                "unit_price": 1699.00,  # ₹1,699
                "rating": 4.8,
                "review_count": 7800,
                "co_purchase_rate": 85.3,
                "requirement_type": "Protection & Travel",
                "compatibility": "Holds 1 camera body + 2 lenses + accessories",
                "review_quote": "Customizable dividers hold my camera, kit lens and 2 extra accessories snugly.",
                "reviewer_name": "Daniel F. (Travel Blogger)",
                "helpful_votes": 220,
            },
        ],
    },

    # ─── 5. SMART 4K TV ─────────────────────────────────────────────────────────
    "PROD-TV-01": {
        "product_id": "PROD-TV-01",
        "product_name": "Bravia 65\" 4K Ultra HD HDR Smart OLED Television",
        "category": "Television & Home Theater",
        "unit_price": 84999.00,  # ₹84,999
        "rating": 4.8,
        "review_count": 4120,
        "description": "Stunning OLED picture quality with self-lit pixels, Dolby Vision HDR, and native 120Hz refresh rate.",
        "accessories": [
            {
                "accessory_id": "ACC-MOUNT-01",
                "product_name": "Heavy-Duty Full Motion Articulating TV Wall Mount (37\"-75\")",
                "category": "TV Accessories",
                "unit_price": 1999.00,  # ₹1,999
                "rating": 4.8,
                "review_count": 24500,
                "co_purchase_rate": 89.4,
                "requirement_type": "Essential Installation",
                "compatibility": "VESA 200x200 to 600x400 up to 60 kg",
                "review_quote": "Mounted this 65 inch TV effortlessly into the wall. Swivels smoothly across the whole living room.",
                "reviewer_name": "George P. (Homeowner)",
                "helpful_votes": 910,
            },
            {
                "accessory_id": "ACC-HDMI-01",
                "product_name": "Certified Ultra High Speed 8K / 4K@120Hz HDMI 2.1 Cable (10ft)",
                "category": "TV Accessories",
                "unit_price": 699.00,  # ₹699
                "rating": 4.9,
                "review_count": 31000,
                "co_purchase_rate": 92.1,
                "requirement_type": "Required for High Refresh",
                "compatibility": "48Gbps Bandwidth, eARC, VRR, ALLM",
                "review_quote": "The included HDMI cable couldn't do 4K 120Hz. This cable unlocked full HDR gaming instantly.",
                "reviewer_name": "Anthony V. (Console Gamer)",
                "helpful_votes": 670,
            },
            {
                "accessory_id": "ACC-SOUNDBAR-01",
                "product_name": "Dolby Atmos 2.1 Channel Soundbar with Wireless Subwoofer",
                "category": "Audio & Sound",
                "unit_price": 8999.00,  # ₹8,999
                "rating": 4.7,
                "review_count": 9800,
                "co_purchase_rate": 78.6,
                "requirement_type": "Audio Upgrade",
                "compatibility": "HDMI eARC one-cable audio setup",
                "review_quote": "Thin modern TVs have weak speakers; this soundbar brought movie theater bass and crystal clear dialogue.",
                "reviewer_name": "Rachel L. (Movie Fan)",
                "helpful_votes": 430,
            },
            {
                "accessory_id": "ACC-SURGE-01",
                "product_name": "8-Outlet 4000 Joules Surge Protector Power Strip with 4 USB Ports",
                "category": "Home Electronics",
                "unit_price": 999.00,  # ₹999
                "rating": 4.9,
                "review_count": 18200,
                "co_purchase_rate": 84.7,
                "requirement_type": "Electrical Protection",
                "compatibility": "Protects expensive TV, soundbar and console",
                "review_quote": "Protecting a high-end OLED TV with a high joule surge strip is common sense.",
                "reviewer_name": "Scott W. (Verified Buyer)",
                "helpful_votes": 355,
            },
        ],
    },

    # ─── 6. ESPRESSO & COFFEE MACHINE ───────────────────────────────────────────
    "PROD-COFFEE-01": {
        "product_id": "PROD-COFFEE-01",
        "product_name": "Barista Express Compact Espresso Machine with Steam Wand",
        "category": "Kitchen & Appliances",
        "unit_price": 26999.00,  # ₹26,999
        "rating": 4.7,
        "review_count": 7830,
        "description": "15-bar Italian pump espresso maker with micro-foam milk texturing wand for cafe-quality cappuccinos at home.",
        "accessories": [
            {
                "accessory_id": "ACC-BEANS-01",
                "product_name": "Organic Dark Roast Whole Bean Espresso Coffee (1 kg Bag)",
                "category": "Kitchen & Pantry",
                "unit_price": 899.00,  # ₹899
                "rating": 4.9,
                "review_count": 19400,
                "co_purchase_rate": 94.3,
                "requirement_type": "Required to Brew",
                "compatibility": "Fresh roasted Arabica beans optimized for espresso extraction",
                "review_quote": "Produces a rich, thick golden crema with zero bitterness. Best beans for this machine by far.",
                "reviewer_name": "Marco B. (Coffee Enthusiast)",
                "helpful_votes": 820,
            },
            {
                "accessory_id": "ACC-PITCHER-01",
                "product_name": "Stainless Steel Milk Frothing Pitcher with Measurement Marks (350ml)",
                "category": "Coffee Accessories",
                "unit_price": 499.00,  # ₹499
                "rating": 4.8,
                "review_count": 11200,
                "co_purchase_rate": 88.0,
                "requirement_type": "Latte Art Essential",
                "compatibility": "Food grade 304 stainless steel",
                "review_quote": "Internal ounce markings let you pour the exact milk amount. Makes silky microfoam with the steam wand.",
                "reviewer_name": "Hannah S. (Home Barista)",
                "helpful_votes": 295,
            },
            {
                "accessory_id": "ACC-TAMPER-01",
                "product_name": "Calibrated Spring-Loaded 54mm Espresso Tamper (30 lbs Pressure)",
                "category": "Coffee Accessories",
                "unit_price": 899.00,  # ₹899
                "rating": 4.8,
                "review_count": 5900,
                "co_purchase_rate": 81.2,
                "requirement_type": "Precision Extraction",
                "compatibility": "54mm Portafilter baskets",
                "review_quote": "Eliminated channeling completely. Gives the same 30lb level tamp every single morning.",
                "reviewer_name": "Eric D. (Coffee Geek)",
                "helpful_votes": 360,
            },
            {
                "accessory_id": "ACC-DESCALER-01",
                "product_name": "Eco-Friendly Universal Espresso Machine Descaling Solution (2 Uses)",
                "category": "Coffee Accessories",
                "unit_price": 449.00,  # ₹449
                "rating": 4.7,
                "review_count": 8400,
                "co_purchase_rate": 79.5,
                "requirement_type": "Maintenance & Longevity",
                "compatibility": "Removes hard water mineral build-up",
                "review_quote": "Run this every 3 months to keep the water pressure strong and pump running like day one.",
                "reviewer_name": "Paulina G. (Verified Buyer)",
                "helpful_votes": 170,
            },
        ],
    },
}
