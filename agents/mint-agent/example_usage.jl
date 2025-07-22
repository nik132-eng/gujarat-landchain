# 🤖 ULPIN Mint Agent Example Usage
# Gujarat LandChain × JuliaOS Integration Demo

# Import the mint agent
include("MintAgent.jl")
include("MetadataCreator.jl") 
include("IPFSIntegration.jl")

using .MintAgent
using Dates

"""
Example usage of the ULPIN Mint Agent for minting land parcel NFTs.
This demonstrates the complete workflow from land data input to NFT minting.
"""

function main()
    println("🚀 ULPIN Mint Agent Demo - Gujarat LandChain × JuliaOS")
    println("=" ^ 60)
    
    # Step 1: Initialize the mint agent
    println("\n📊 Step 1: Initializing Mint Agent")
    agent = ULPINMintAgent(
        contract_address = "0x742d35cc6c3b2b8b19e503e26bc2e7e8b3cda3e6",  # Mock Polygon Mumbai contract
        validation_threshold = 0.85,
        satellite_sources = ["sentinel-2", "landsat-8", "cartosat"]
    )
    
    println("✅ Agent initialized successfully")
    println("   Agent ID: $(agent.agent_id)")
    println("   Contract: $(agent.contract_address)")
    println("   Validation Threshold: $(agent.validation_threshold)")
    
    # Step 2: Prepare sample land data
    println("\n🏞️  Step 2: Preparing Land Parcel Data")
    
    # Example 1: Agricultural land in Ahmedabad
    agricultural_land = Dict(
        "coordinates" => Dict(
            "latitude" => 22.8461,   # Bavla, Ahmedabad
            "longitude" => 72.3809
        ),
        "area_hectares" => 2.5,
        "district" => "Ahmedabad",
        "taluka" => "Bavla",
        "village" => "Bavla",
        "survey_number" => "123/1",
        "land_type" => "agricultural",
        "soil_type" => "black_cotton",
        "irrigation" => Dict(
            "available" => true,
            "source" => "canal",
            "quality" => "good"
        ),
        "ownership_type" => "private",
        "rights" => "full_ownership",
        "encumbrance" => false,
        "market_value" => 5000000,  # ₹50 lakhs
        "pincode" => "382220"
    )
    
    println("✅ Agricultural land data prepared")
    println("   Location: $(agricultural_land["village"]), $(agricultural_land["district"])")
    println("   Area: $(agricultural_land["area_hectares"]) hectares")
    println("   Soil Type: $(agricultural_land["soil_type"])")
    
    # Step 3: Mint the agricultural land NFT
    println("\n🎯 Step 3: Minting Agricultural Land NFT")
    
    try
        tx_hash_ag = mint_land_parcel!(agent, agricultural_land)
        println("✅ Agricultural land NFT minted successfully!")
        println("   Transaction Hash: $tx_hash_ag")
        println("   ULPIN Generated: ULPIN-$(generate_ulpin_id(agricultural_land))")
        
    catch e
        println("❌ Failed to mint agricultural land NFT: $e")
        return
    end
    
    # Step 4: Prepare residential land data
    println("\n🏘️  Step 4: Preparing Residential Land Data")
    
    residential_land = Dict(
        "coordinates" => Dict(
            "latitude" => 23.0225,   # Gandhinagar
            "longitude" => 72.5714
        ),
        "area_hectares" => 0.1,  # 1000 sq meters
        "district" => "Gandhinagar",
        "taluka" => "Gandhinagar",
        "village" => "Sector 1",
        "survey_number" => "456",
        "land_type" => "residential",
        "soil_type" => "sandy",
        "irrigation" => Dict(
            "available" => true,
            "source" => "municipal",
            "quality" => "excellent"
        ),
        "ownership_type" => "private",
        "rights" => "full_ownership",
        "encumbrance" => false,
        "market_value" => 8000000,  # ₹80 lakhs
        "pincode" => "382007"
    )
    
    println("✅ Residential land data prepared")
    println("   Location: $(residential_land["village"]), $(residential_land["district"])")
    println("   Area: $(residential_land["area_hectares"]) hectares ($(residential_land["area_hectares"] * 10000) sq meters)")
    
    # Step 5: Mint the residential land NFT
    println("\n🎯 Step 5: Minting Residential Land NFT")
    
    try
        tx_hash_res = mint_land_parcel!(agent, residential_land)
        println("✅ Residential land NFT minted successfully!")
        println("   Transaction Hash: $tx_hash_res")
        println("   ULPIN Generated: ULPIN-$(generate_ulpin_id(residential_land))")
        
    catch e
        println("❌ Failed to mint residential land NFT: $e")
        return
    end
    
    # Step 6: Display agent statistics
    println("\n📊 Step 6: Agent Performance Summary")
    stats = get_mint_agent_stats(agent)
    
    println("✅ Mint Agent Statistics:")
    println("   Total Mints: $(stats["total_mints"])")
    println("   Success Rate: $(stats["success_rate"])")
    println("   Last Mint: $(stats["last_mint"])")
    println("   Agent State: $(stats["state"])")
    
    # Step 7: Test validation edge cases
    println("\n🧪 Step 7: Testing Validation Edge Cases")
    
    # Invalid coordinates (outside Gujarat)
    invalid_land = Dict(
        "coordinates" => Dict("latitude" => 19.0, "longitude" => 77.0),  # Mumbai coordinates
        "area_hectares" => 1.0,
        "district" => "Mumbai",
        "village" => "Test",
        "survey_number" => "789",
        "land_type" => "commercial",
        "soil_type" => "alluvial"
    )
    
    try
        mint_land_parcel!(agent, invalid_land)
        println("❌ Should have failed validation!")
    catch e
        println("✅ Correctly rejected invalid coordinates: $(typeof(e).__name__)")
    end
    
    # Invalid land type
    invalid_type_land = Dict(
        "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
        "area_hectares" => 1.0,
        "district" => "Ahmedabad",
        "village" => "Test",
        "survey_number" => "999",
        "land_type" => "invalid_type",
        "soil_type" => "alluvial"
    )
    
    try
        mint_land_parcel!(agent, invalid_type_land)
        println("❌ Should have failed validation!")
    catch e
        println("✅ Correctly rejected invalid land type: $(typeof(e).__name__)")
    end
    
    println("\n🎉 Demo completed successfully!")
    println("=" ^ 60)
    
    return agent
end

"""
Demo function showing metadata creation and validation
"""
function demo_metadata_creation()
    println("\n🔍 Metadata Creation Demo")
    println("-" ^ 40)
    
    # Sample land data
    land_data = Dict(
        "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
        "area_hectares" => 2.5,
        "district" => "Ahmedabad",
        "village" => "Bavla",
        "survey_number" => "123/1",
        "land_type" => "agricultural",
        "soil_type" => "black_cotton"
    )
    
    # Generate ULPIN
    ulpin_id = generate_ulpin_id(land_data)
    println("📋 Generated ULPIN: $ulpin_id")
    
    # Create mock satellite data
    satellite_data = Dict(
        "primary_image" => Dict(
            "source" => "sentinel-2",
            "capture_date" => "2024-07-15",
            "resolution" => 10.0,
            "cloud_cover" => 5.0,
            "image_data" => "mock_base64_data"
        ),
        "historical_images" => [],
        "ai_analysis" => Dict(
            "crop_detection" => Dict(
                "detected_crops" => ["cotton", "wheat"],
                "confidence" => 0.92
            ),
            "land_cover" => Dict(
                "vegetation_percentage" => 75.0,
                "built_up_percentage" => 5.0
            )
        )
    )
    
    # Create metadata
    metadata = create_nft_metadata(ulpin_id, land_data, satellite_data)
    
    println("✅ Metadata created successfully")
    println("   Name: $(metadata["name"])")
    println("   Description length: $(length(metadata["description"])) characters")
    println("   Attributes count: $(length(metadata["attributes"]))")
    println("   Satellite source: $(metadata["satellite_imagery"]["primary_image"]["satellite_source"])")
    
    # Validate metadata
    try
        validate_metadata!(metadata)
        println("✅ Metadata validation passed")
    catch e
        println("❌ Metadata validation failed: $e")
    end
end

"""
Demo function showing satellite imagery integration
"""
function demo_satellite_integration()
    println("\n🛰️  Satellite Integration Demo")
    println("-" ^ 40)
    
    agent = ULPINMintAgent()
    coordinates = Dict("latitude" => 22.8461, "longitude" => 72.3809)
    
    # Fetch satellite imagery
    satellite_data = fetch_satellite_imagery!(agent, coordinates)
    
    println("✅ Satellite data fetched")
    println("   Primary source: $(satellite_data["primary_image"]["source"])")
    println("   Resolution: $(satellite_data["primary_image"]["resolution"])m")
    println("   Cloud cover: $(satellite_data["primary_image"]["cloud_cover"])%")
    println("   Historical images: $(length(satellite_data["historical_images"]))")
    
    # Display AI analysis
    if haskey(satellite_data, "ai_analysis")
        analysis = satellite_data["ai_analysis"]
        if haskey(analysis, "crop_detection")
            crops = join(analysis["crop_detection"]["detected_crops"], ", ")
            confidence = analysis["crop_detection"]["confidence"]
            println("   Detected crops: $crops ($(round(confidence*100, digits=1))% confidence)")
        end
        
        if haskey(analysis, "land_cover")
            vegetation = analysis["land_cover"]["vegetation_percentage"]
            println("   Vegetation cover: $(vegetation)%")
        end
    end
end

# Run the demo if this file is executed directly
if abspath(PROGRAM_FILE) == @__FILE__
    println("Starting ULPIN Mint Agent Demo...")
    
    # Run main demo
    agent = main()
    
    # Run additional demos
    demo_metadata_creation()
    demo_satellite_integration()
    
    println("\n🎯 All demos completed successfully!")
    println("Ready for GL-0104: Deploy to Polygon Mumbai")
end
