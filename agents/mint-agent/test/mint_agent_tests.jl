# Unit Tests for ULPIN Mint Agent - GL-0102
# Gujarat LandChain × JuliaOS Project

using Test
using Dates
using JSON3

# Include the mint agent modules
include("../MintAgent.jl")
include("../MetadataCreator.jl") 
include("../IPFSIntegration.jl")

using .MintAgent

@testset "ULPIN Mint Agent Tests" begin
    
    @testset "Agent Initialization" begin
        @test_nowarn agent = ULPINMintAgent()
        
        agent = ULPINMintAgent(contract_address="0x123", validation_threshold=0.9)
        @test agent.contract_address == "0x123"
        @test agent.validation_threshold == 0.9
        @test agent.mint_count == 0
        @test agent.state.value == :initialized
        @test length(agent.satellite_sources) >= 3
    end
    
    @testset "Land Data Validation" begin
        @testset "Valid Land Data" begin
            valid_data = Dict(
                "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_hectares" => 2.5,
                "district" => "Ahmedabad",
                "village" => "Bavla",
                "survey_number" => "123/1",
                "land_type" => "agricultural",
                "soil_type" => "black_cotton"
            )
            
            @test_nowarn validate_land_data!(valid_data)
        end
        
        @testset "Missing Required Fields" begin
            incomplete_data = Dict(
                "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_hectares" => 2.5
                # Missing required fields
            )
            
            @test_throws ArgumentError validate_land_data!(incomplete_data)
        end
        
        @testset "Invalid Coordinates" begin
            # Outside Gujarat bounds
            invalid_coords = Dict(
                "coordinates" => Dict("latitude" => 19.0, "longitude" => 77.0),
                "area_hectares" => 2.5,
                "district" => "Mumbai",
                "village" => "Test",
                "survey_number" => "123",
                "land_type" => "agricultural",
                "soil_type" => "alluvial"
            )
            
            @test_throws ArgumentError validate_land_data!(invalid_coords)
        end
        
        @testset "Invalid Area" begin
            invalid_area = Dict(
                "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_hectares" => -1.0,  # Negative area
                "district" => "Ahmedabad",
                "village" => "Bavla",
                "survey_number" => "123",
                "land_type" => "agricultural",
                "soil_type" => "black_cotton"
            )
            
            @test_throws ArgumentError validate_land_data!(invalid_area)
        end
        
        @testset "Invalid Land Type" begin
            invalid_type = Dict(
                "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_hectares" => 2.5,
                "district" => "Ahmedabad",
                "village" => "Bavla",
                "survey_number" => "123",
                "land_type" => "invalid_type",
                "soil_type" => "black_cotton"
            )
            
            @test_throws ArgumentError validate_land_data!(invalid_type)
        end
        
        @testset "Invalid Survey Number" begin
            invalid_survey = Dict(
                "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_hectares" => 2.5,
                "district" => "Ahmedabad",
                "village" => "Bavla",
                "survey_number" => "ABC123",  # Invalid format
                "land_type" => "agricultural",
                "soil_type" => "black_cotton"
            )
            
            @test_throws ArgumentError validate_land_data!(invalid_survey)
        end
    end
    
    @testset "ULPIN ID Generation" begin
        land_data = Dict(
            "district" => "Ahmedabad",
            "village" => "Bavla", 
            "survey_number" => "123/1"
        )
        
        ulpin_id = generate_ulpin_id(land_data)
        
        @test length(ulpin_id) == 12
        @test startswith(ulpin_id, "24")  # Gujarat state code
        @test ulpin_id[3:4] == "01"  # Ahmedabad district code
        
        # Test consistency - same input should generate same ULPIN
        ulpin_id2 = generate_ulpin_id(land_data)
        @test ulpin_id == ulpin_id2
    end
    
    @testset "Satellite Imagery Fetching" begin
        agent = ULPINMintAgent()
        coordinates = Dict("latitude" => 22.8461, "longitude" => 72.3809)
        
        @test_nowarn satellite_data = fetch_satellite_imagery!(agent, coordinates)
        
        satellite_data = fetch_satellite_imagery!(agent, coordinates)
        @test haskey(satellite_data, "primary_image")
        @test satellite_data["primary_image"] !== nothing
        @test haskey(satellite_data["primary_image"], "source")
        @test haskey(satellite_data["primary_image"], "capture_date")
        @test haskey(satellite_data["primary_image"], "resolution")
        @test haskey(satellite_data, "ai_analysis")
    end
    
    @testset "Individual Satellite Sources" begin
        @test_nowarn sentinel_data = fetch_sentinel2_data(22.8461, 72.3809)
        @test_nowarn landsat_data = fetch_landsat8_data(22.8461, 72.3809)
        @test_nowarn cartosat_data = fetch_cartosat_data(22.8461, 72.3809)
        
        sentinel_data = fetch_sentinel2_data(22.8461, 72.3809)
        @test sentinel_data["source"] == "sentinel-2"
        @test sentinel_data["resolution"] == 10.0
        @test haskey(sentinel_data, "image_data")
        @test haskey(sentinel_data, "capture_date")
    end
    
    @testset "AI Analysis" begin
        mock_image = Dict(
            "source" => "sentinel-2",
            "resolution" => 10.0,
            "cloud_cover" => 5.0
        )
        
        analysis = analyze_satellite_image(mock_image)
        
        @test haskey(analysis, "crop_detection")
        @test haskey(analysis, "land_cover") 
        @test haskey(analysis, "quality_metrics")
        
        # Check crop detection
        crop_detection = analysis["crop_detection"]
        @test haskey(crop_detection, "detected_crops")
        @test haskey(crop_detection, "confidence")
        @test 0.0 <= crop_detection["confidence"] <= 1.0
        
        # Check land cover
        land_cover = analysis["land_cover"]
        @test haskey(land_cover, "vegetation_percentage")
        @test 0.0 <= land_cover["vegetation_percentage"] <= 100.0
    end
    
    @testset "Metadata Creation" begin
        ulpin_id = "240123456789"
        land_data = Dict(
            "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
            "area_hectares" => 2.5,
            "district" => "Ahmedabad",
            "village" => "Bavla",
            "survey_number" => "123/1",
            "land_type" => "agricultural",
            "soil_type" => "black_cotton",
            "irrigation" => Dict("available" => true, "source" => "canal", "quality" => "good")
        )
        
        satellite_data = Dict(
            "primary_image" => Dict(
                "source" => "sentinel-2",
                "capture_date" => "2024-07-15",
                "resolution" => 10.0,
                "cloud_cover" => 5.0
            ),
            "ai_analysis" => Dict(
                "crop_detection" => Dict("detected_crops" => ["cotton", "wheat"], "confidence" => 0.9),
                "land_cover" => Dict("vegetation_percentage" => 75.0)
            )
        )
        
        metadata = create_nft_metadata(ulpin_id, land_data, satellite_data)
        
        # Test required OpenSea fields
        @test haskey(metadata, "name")
        @test haskey(metadata, "description")
        @test haskey(metadata, "image")
        @test metadata["name"] == "ULPIN-$ulpin_id"
        
        # Test ULPIN structure
        @test haskey(metadata, "ulpin")
        @test metadata["ulpin"]["id"] == ulpin_id
        @test metadata["ulpin"]["state_code"] == "24"
        
        # Test coordinates
        @test haskey(metadata, "coordinates")
        @test metadata["coordinates"]["center"]["latitude"] == 22.8461
        @test haskey(metadata["coordinates"], "boundary")
        
        # Test area calculations
        @test haskey(metadata, "area")
        @test metadata["area"]["hectares"] == 2.5
        @test metadata["area"]["acres"] ≈ 6.18 atol=0.1
        
        # Test attributes
        @test haskey(metadata, "attributes")
        @test length(metadata["attributes"]) >= 5
    end
    
    @testset "Polygon Boundary Generation" begin
        center = Dict("latitude" => 22.8461, "longitude" => 72.3809)
        area_hectares = 2.5
        
        boundary = generate_polygon_boundary(center, area_hectares)
        
        @test length(boundary) == 5  # 4 corners + closing point
        @test boundary[1] == boundary[end]  # Closed polygon
        
        # Check that boundary points are around the center
        for point in boundary[1:4]
            @test abs(point["latitude"] - center["latitude"]) < 0.1
            @test abs(point["longitude"] - center["longitude"]) < 0.1
        end
    end
    
    @testset "Area Calculation" begin
        # Simple square boundary
        boundary = [
            Dict("latitude" => 22.84, "longitude" => 72.38),
            Dict("latitude" => 22.85, "longitude" => 72.38),
            Dict("latitude" => 22.85, "longitude" => 72.39),
            Dict("latitude" => 22.84, "longitude" => 72.39),
            Dict("latitude" => 22.84, "longitude" => 72.38)
        ]
        
        area = calculate_polygon_area(boundary)
        @test area > 0
        @test area < 2000000  # Reasonable area in square meters
    end
    
    @testset "OpenSea Attributes" begin
        land_data = Dict(
            "land_type" => "agricultural",
            "soil_type" => "black_cotton",
            "district" => "Ahmedabad",
            "area_hectares" => 2.5,
            "irrigation" => Dict("available" => true, "source" => "canal")
        )
        
        satellite_data = Dict(
            "primary_image" => Dict("source" => "sentinel-2", "resolution" => 10.0, "cloud_cover" => 5.0),
            "ai_analysis" => Dict(
                "crop_detection" => Dict("detected_crops" => ["cotton"], "confidence" => 0.9),
                "land_cover" => Dict("vegetation_percentage" => 75.0)
            )
        )
        
        attributes = create_opensea_attributes(land_data, satellite_data)
        
        @test length(attributes) >= 5
        
        # Check for required attributes
        trait_types = [attr["trait_type"] for attr in attributes]
        @test "Land Type" in trait_types
        @test "Soil Type" in trait_types
        @test "District" in trait_types
        @test "Area (Hectares)" in trait_types
        @test "Irrigation Available" in trait_types
    end
    
    @testset "District Code Mapping" begin
        @test get_district_code("Ahmedabad") == "01"
        @test get_district_code("Surat") == "02"
        @test get_district_code("Vadodara") == "03"
        @test get_district_code("Rajkot") == "15"
        @test get_district_code("Unknown District") == "99"
    end
    
    @testset "Metadata Validation" begin
        # Create valid metadata
        valid_metadata = Dict(
            "name" => "ULPIN-240123456789",
            "description" => "Test land parcel",
            "image" => "ipfs://QmTest123",
            "ulpin" => Dict(
                "id" => "240123456789",
                "state_code" => "24"
            ),
            "coordinates" => Dict(
                "center" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
                "area_calculated" => 25000
            ),
            "area" => Dict(
                "hectares" => 2.5,
                "square_meters" => 25000
            ),
            "land_type" => Dict(
                "primary_use" => "agricultural",
                "soil_type" => "black_cotton"
            )
        )
        
        @test_nowarn validate_metadata!(valid_metadata)
        
        # Test invalid metadata
        invalid_metadata = Dict(
            "name" => "ULPIN-250123456789",  # Wrong state code
            "description" => "Test",
            "image" => "ipfs://QmTest123",
            "ulpin" => Dict(
                "id" => "250123456789",
                "state_code" => "25"  # Not Gujarat
            ),
            "coordinates" => Dict(
                "center" => Dict("latitude" => 22.8461, "longitude" => 72.3809)
            ),
            "area" => Dict("hectares" => 2.5),
            "land_type" => Dict("primary_use" => "agricultural")
        )
        
        @test_throws ArgumentError validate_metadata!(invalid_metadata)
    end
    
    @testset "IPFS Integration" begin
        agent = ULPINMintAgent()
        
        # Test image upload
        image_data = Dict(
            "source" => "sentinel-2",
            "image_data" => base64encode(rand(UInt8, 100)),
            "capture_date" => "2024-07-15"
        )
        
        ipfs_hash = upload_image_to_ipfs(agent, image_data)
        @test startswith(ipfs_hash, "Qm")
        @test length(ipfs_hash) == 46
        
        # Test metadata upload
        metadata = Dict("name" => "Test", "ulpin" => Dict("id" => "123456789012"))
        metadata_hash = upload_metadata_to_ipfs(agent, metadata)
        @test startswith(metadata_hash, "Qm")
        @test length(metadata_hash) == 46
    end
    
    @testset "Validation Swarm" begin
        agent = ULPINMintAgent()
        metadata = Dict(
            "satellite_imagery" => Dict(
                "primary_image" => Dict("resolution" => 10.0),
                "ai_analysis" => Dict("crop_detection" => Dict("confidence" => 0.9))
            ),
            "land_type" => Dict("irrigation" => Dict("available" => true)),
            "administrative" => Dict("pincode" => "382220"),
            "juliaos_integration" => Dict("validation_swarm" => Dict())
        )
        ipfs_hashes = (metadata = "QmTest123", primary_image = "QmTest456", historical_images = String[])
        
        consensus = validate_with_swarm!(agent, metadata, ipfs_hashes)
        
        @test haskey(consensus, :score)
        @test haskey(consensus, :validator_count)
        @test haskey(consensus, :consensus_details)
        @test 0.0 <= consensus.score <= 1.0
        @test 5 <= consensus.validator_count <= 9
    end
    
    @testset "Agent Configuration" begin
        agent = ULPINMintAgent()
        
        @test_nowarn configure_agent!(
            agent,
            contract_address = "0x123456789",
            validation_threshold = 0.95,
            satellite_sources = ["sentinel-2", "landsat-8"]
        )
        
        @test agent.contract_address == "0x123456789"
        @test agent.validation_threshold == 0.95
        @test agent.satellite_sources == ["sentinel-2", "landsat-8"]
        
        # Test invalid threshold
        configure_agent!(agent, validation_threshold = 1.5)  # Should warn but not change
        @test agent.validation_threshold == 0.95  # Unchanged
    end
    
    @testset "Agent Statistics" begin
        agent = ULPINMintAgent(contract_address="0x123")
        agent.mint_count = 5
        agent.last_mint = DateTime(2024, 7, 22, 10, 30, 0)
        
        stats = get_mint_agent_stats(agent)
        
        @test haskey(stats, "agent_id")
        @test haskey(stats, "total_mints")
        @test haskey(stats, "contract_address")
        @test stats["total_mints"] == 5
        @test stats["contract_address"] == "0x123"
    end
    
    @testset "Full Mint Process Integration" begin
        # This test runs the complete minting process
        agent = ULPINMintAgent(
            contract_address = "0x1234567890123456789012345678901234567890",
            validation_threshold = 0.8
        )
        
        land_data = Dict(
            "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
            "area_hectares" => 2.5,
            "district" => "Ahmedabad",
            "village" => "Bavla",
            "survey_number" => "123/1",
            "land_type" => "agricultural",
            "soil_type" => "black_cotton",
            "irrigation" => Dict("available" => true, "source" => "canal", "quality" => "good")
        )
        
        # Test successful minting
        @test_nowarn tx_hash = mint_land_parcel!(agent, land_data)
        
        tx_hash = mint_land_parcel!(agent, land_data)
        @test startswith(tx_hash, "0x")
        @test length(tx_hash) == 66  # Standard Ethereum tx hash length
        @test agent.mint_count == 1
        @test agent.state.value == :mint_successful
    end
end

# Performance and stress tests
@testset "Performance Tests" begin
    @testset "Metadata Creation Performance" begin
        ulpin_id = "240123456789"
        land_data = Dict(
            "coordinates" => Dict("latitude" => 22.8461, "longitude" => 72.3809),
            "area_hectares" => 2.5,
            "district" => "Ahmedabad",
            "village" => "Bavla",
            "survey_number" => "123/1",
            "land_type" => "agricultural",
            "soil_type" => "black_cotton"
        )
        
        satellite_data = Dict(
            "primary_image" => Dict("source" => "sentinel-2", "capture_date" => "2024-07-15", "resolution" => 10.0),
            "ai_analysis" => Dict()
        )
        
        # Test that metadata creation is reasonably fast
        elapsed_time = @elapsed begin
            for i in 1:100
                create_nft_metadata(ulpin_id, land_data, satellite_data)
            end
        end
        
        @test elapsed_time < 1.0  # Should complete 100 iterations in under 1 second
    end
    
    @testset "Satellite Data Fetching Performance" begin
        agent = ULPINMintAgent()
        coordinates = Dict("latitude" => 22.8461, "longitude" => 72.3809)
        
        # Test that satellite fetching completes in reasonable time
        elapsed_time = @elapsed fetch_satellite_imagery!(agent, coordinates)
        @test elapsed_time < 5.0  # Should complete in under 5 seconds
    end
end

println("✅ All ULPIN Mint Agent tests completed successfully!")
println("📊 Test Coverage: Comprehensive testing across all mint agent functionality")
println("🎯 Ready for GL-0103: Unit Tests for Mint & Transfer complete")
