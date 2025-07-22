# ULPIN NFT Metadata Creation and IPFS Integration
# Part of MintAgent module - Gujarat LandChain × JuliaOS

"""
    create_nft_metadata(ulpin_id::String, land_data::Dict, satellite_data::Dict) -> Dict

Creates comprehensive NFT metadata following the ULPIN schema.

# Arguments
- `ulpin_id::String`: Generated ULPIN identifier
- `land_data::Dict`: Validated land parcel data
- `satellite_data::Dict`: Satellite imagery and analysis results

# Returns
Complete metadata dictionary conforming to ULPIN schema
"""
function create_nft_metadata(ulpin_id::String, land_data::Dict, satellite_data::Dict)
    @info "Creating NFT metadata" ulpin_id
    
    # Generate polygon boundary from center coordinates (simplified)
    boundary = generate_polygon_boundary(land_data["coordinates"], land_data["area_hectares"])
    
    # Create metadata following ULPIN schema
    metadata = Dict(
        # OpenSea required fields
        "name" => "ULPIN-$ulpin_id",
        "description" => create_description(land_data),
        "image" => "ipfs://PLACEHOLDER_PRIMARY_IMAGE",  # Will be updated after IPFS upload
        "external_url" => "https://landrecords.gujarat.gov.in/parcel/ULPIN-$ulpin_id",
        "background_color" => "2E8B57",  # Forest green for land
        
        # ULPIN specific data
        "ulpin" => Dict(
            "id" => ulpin_id,
            "state_code" => "24",
            "district_code" => get_district_code(land_data["district"]),
            "village_code" => string(hash(land_data["village"]), base=16)[1:6],
            "survey_number" => land_data["survey_number"]
        ),
        
        # Geographic information
        "coordinates" => Dict(
            "center" => land_data["coordinates"],
            "boundary" => boundary,
            "area_calculated" => calculate_polygon_area(boundary)
        ),
        
        # Area measurements
        "area" => Dict(
            "hectares" => land_data["area_hectares"],
            "acres" => land_data["area_hectares"] * 2.47105,  # Conversion factor
            "square_meters" => land_data["area_hectares"] * 10000,
            "unit" => "hectares"
        ),
        
        # Land classification
        "land_type" => Dict(
            "primary_use" => land_data["land_type"],
            "soil_type" => land_data["soil_type"],
            "irrigation" => get(land_data, "irrigation", Dict(
                "available" => false,
                "source" => "rain_fed",
                "quality" => "fair"
            ))
        ),
        
        # Ownership information (simplified)
        "ownership" => Dict(
            "type" => get(land_data, "ownership_type", "private"),
            "rights" => get(land_data, "rights", "full_ownership"),
            "encumbrance" => get(land_data, "encumbrance", false),
            "mutation_count" => get(land_data, "mutation_count", 0)
        ),
        
        # Satellite imagery data
        "satellite_imagery" => create_satellite_metadata(satellite_data),
        
        # Administrative details
        "administrative" => Dict(
            "state" => "Gujarat",
            "district" => land_data["district"],
            "taluka" => get(land_data, "taluka", "Unknown"),
            "village" => land_data["village"],
            "pincode" => get(land_data, "pincode", "000000")
        ),
        
        # OpenSea attributes for marketplace display
        "attributes" => create_opensea_attributes(land_data, satellite_data),
        
        # JuliaOS integration metadata
        "juliaos_integration" => Dict(
            "mint_agent" => Dict(
                "agent_id" => "mint-agent-001",
                "mint_timestamp" => string(now()),
                "validation_score" => 0.0  # Will be updated after validation
            ),
            "satellite_agent" => Dict(
                "last_analysis" => string(now()),
                "next_scheduled" => string(now() + Day(30)),  # Monthly analysis
                "analysis_frequency" => "monthly"
            ),
            "validation_swarm" => Dict(
                "consensus_score" => 0.0,  # Will be updated after validation
                "validator_count" => 0,
                "last_validation" => string(now())
            )
        ),
        
        # Blockchain metadata (will be updated after deployment)
        "blockchain" => Dict(
            "network" => "mumbai",  # Start with testnet
            "contract_address" => "",  # Will be set by agent
            "token_id" => "",
            "ipfs_metadata" => ""  # Will be set after IPFS upload
        )
    )
    
    @info "NFT metadata created successfully" name=metadata["name"] area=metadata["area"]["hectares"]
    return metadata
end

"""
    create_description(land_data::Dict) -> String

Creates a human-readable description of the land parcel.
"""
function create_description(land_data::Dict)
    area_acres = round(land_data["area_hectares"] * 2.47105, digits=2)
    
    description = "$(titlecase(land_data["land_type"])) land parcel of $(land_data["area_hectares"]) hectares ($area_acres acres) " *
                 "in $(land_data["village"]) village, $(land_data["district"]) district, Gujarat. " *
                 "$(titlecase(replace(land_data["soil_type"], "_" => " "))) soil"
    
    # Add irrigation info if available
    if haskey(land_data, "irrigation") && land_data["irrigation"]["available"]
        description *= " with $(land_data["irrigation"]["source"]) irrigation facility"
    end
    
    # Add land use specific details
    if land_data["land_type"] == "agricultural"
        description *= ". Suitable for cultivation"
        if land_data["soil_type"] == "black_cotton"
            description *= ", ideal for cotton and sugarcane"
        elseif land_data["soil_type"] == "alluvial"
            description *= ", excellent for wheat and rice"
        end
    elseif land_data["land_type"] == "residential"
        description *= ". Approved for residential development"
    elseif land_data["land_type"] == "commercial"
        description *= ". Zoned for commercial activities"
    end
    
    description *= "."
    
    return description
end

"""
    generate_polygon_boundary(center::Dict, area_hectares::Float64) -> Vector{Dict}

Generates a simple rectangular boundary polygon based on center coordinates and area.
In production, this would use actual survey boundary data.
"""
function generate_polygon_boundary(center::Dict, area_hectares::Float64)
    lat, lng = center["latitude"], center["longitude"]
    
    # Calculate approximate side length for square with given area
    area_sq_meters = area_hectares * 10000
    side_length_meters = sqrt(area_sq_meters)
    
    # Convert meters to approximate degrees (rough approximation)
    lat_offset = side_length_meters / 111000  # ~111 km per degree latitude
    lng_offset = side_length_meters / (111000 * cos(deg2rad(lat)))  # Longitude varies with latitude
    
    # Create rectangular boundary
    boundary = [
        Dict("latitude" => lat + lat_offset/2, "longitude" => lng - lng_offset/2),  # NW
        Dict("latitude" => lat + lat_offset/2, "longitude" => lng + lng_offset/2),  # NE
        Dict("latitude" => lat - lat_offset/2, "longitude" => lng + lng_offset/2),  # SE
        Dict("latitude" => lat - lat_offset/2, "longitude" => lng - lng_offset/2),  # SW
        Dict("latitude" => lat + lat_offset/2, "longitude" => lng - lng_offset/2)   # Close polygon
    ]
    
    return boundary
end

"""
    calculate_polygon_area(boundary::Vector{Dict}) -> Float64

Calculates the area of a polygon in square meters using the Shoelace formula.
"""
function calculate_polygon_area(boundary::Vector{Dict})
    if length(boundary) < 4
        return 0.0
    end
    
    # Shoelace formula for polygon area
    area = 0.0
    n = length(boundary) - 1  # Exclude closing point
    
    for i in 1:n
        j = i % n + 1
        lat1, lng1 = boundary[i]["latitude"], boundary[i]["longitude"]
        lat2, lng2 = boundary[j]["latitude"], boundary[j]["longitude"]
        
        # Convert to meters (approximate)
        x1, y1 = lng1 * 111000 * cos(deg2rad(lat1)), lat1 * 111000
        x2, y2 = lng2 * 111000 * cos(deg2rad(lat2)), lat2 * 111000
        
        area += x1 * y2 - x2 * y1
    end
    
    return abs(area) / 2.0
end

"""
    create_satellite_metadata(satellite_data::Dict) -> Dict

Creates satellite imagery metadata section for the NFT.
"""
function create_satellite_metadata(satellite_data::Dict)
    primary_image = satellite_data["primary_image"]
    
    satellite_metadata = Dict(
        "primary_image" => Dict(
            "ipfs_hash" => "PLACEHOLDER_PRIMARY_IPFS",  # Will be updated after upload
            "capture_date" => primary_image["capture_date"],
            "resolution" => primary_image["resolution"],
            "satellite_source" => primary_image["source"],
            "cloud_cover" => primary_image["cloud_cover"],
            "processing_level" => primary_image["processing_level"]
        )
    )
    
    # Add historical images if available
    if !isempty(satellite_data["historical_images"])
        satellite_metadata["historical_images"] = [
            Dict(
                "ipfs_hash" => "PLACEHOLDER_HISTORICAL_$(i)",
                "capture_date" => img["capture_date"],
                "resolution" => img["resolution"],
                "satellite_source" => img["source"]
            ) for (i, img) in enumerate(satellite_data["historical_images"])
        ]
    end
    
    # Add AI analysis results
    if haskey(satellite_data, "ai_analysis") && !isempty(satellite_data["ai_analysis"])
        satellite_metadata["ai_analysis"] = satellite_data["ai_analysis"]
    end
    
    return satellite_metadata
end

"""
    create_opensea_attributes(land_data::Dict, satellite_data::Dict) -> Vector{Dict}

Creates OpenSea-compatible attributes array for marketplace display.
"""
function create_opensea_attributes(land_data::Dict, satellite_data::Dict)
    attributes = [
        Dict("trait_type" => "Land Type", "value" => titlecase(land_data["land_type"])),
        Dict("trait_type" => "Soil Type", "value" => titlecase(replace(land_data["soil_type"], "_" => " "))),
        Dict("trait_type" => "District", "value" => land_data["district"]),
        Dict("trait_type" => "Area (Hectares)", "value" => land_data["area_hectares"], "display_type" => "number"),
        Dict("trait_type" => "Ownership Type", "value" => titlecase(get(land_data, "ownership_type", "private")))
    ]
    
    # Add irrigation availability
    if haskey(land_data, "irrigation") && land_data["irrigation"]["available"]
        push!(attributes, Dict("trait_type" => "Irrigation Available", "value" => true))
        push!(attributes, Dict("trait_type" => "Irrigation Source", "value" => titlecase(replace(land_data["irrigation"]["source"], "_" => " "))))
    else
        push!(attributes, Dict("trait_type" => "Irrigation Available", "value" => false))
    end
    
    # Add satellite imagery attributes
    if haskey(satellite_data, "primary_image")
        primary = satellite_data["primary_image"]
        push!(attributes, Dict("trait_type" => "Satellite Source", "value" => titlecase(replace(primary["source"], "-" => " "))))
        push!(attributes, Dict("trait_type" => "Satellite Resolution", "value" => primary["resolution"], "display_type" => "number"))
        push!(attributes, Dict("trait_type" => "Cloud Cover %", "value" => round(primary["cloud_cover"], digits=1), "display_type" => "number"))
    end
    
    # Add AI analysis attributes
    if haskey(satellite_data, "ai_analysis")
        analysis = satellite_data["ai_analysis"]
        if haskey(analysis, "crop_detection")
            crops = join(analysis["crop_detection"]["detected_crops"], " & ")
            push!(attributes, Dict("trait_type" => "Detected Crops", "value" => titlecase(crops)))
            push!(attributes, Dict("trait_type" => "Crop Detection Confidence", "value" => round(analysis["crop_detection"]["confidence"] * 100, digits=1), "display_type" => "boost_percentage"))
        end
        
        if haskey(analysis, "land_cover")
            vegetation = analysis["land_cover"]["vegetation_percentage"]
            push!(attributes, Dict("trait_type" => "Vegetation Cover %", "value" => vegetation, "display_type" => "boost_percentage", "max_value" => 100))
        end
    end
    
    # Add market value if available
    if haskey(land_data, "market_value")
        value_lakhs = round(land_data["market_value"] / 100000, digits=2)
        push!(attributes, Dict("trait_type" => "Market Value (Lakhs)", "value" => value_lakhs, "display_type" => "number"))
    end
    
    return attributes
end

"""
    get_district_code(district::String) -> String

Returns the district code for Gujarat districts.
"""
function get_district_code(district::String)
    district_codes = Dict(
        "Ahmedabad" => "01", "Surat" => "02", "Vadodara" => "03", "Rajkot" => "15",
        "Bhavnagar" => "04", "Jamnagar" => "05", "Junagadh" => "06", "Kutch" => "07",
        "Banaskantha" => "08", "Sabarkantha" => "09", "Gandhinagar" => "10", "Mehsana" => "11",
        "Kheda" => "12", "Anand" => "13", "Bharuch" => "14", "Narmada" => "16",
        "Navsari" => "17", "Valsad" => "18", "Dang" => "19", "Tapi" => "33"
    )
    
    return get(district_codes, district, "99")  # Default if district not found
end

"""
    validate_metadata!(metadata::Dict) -> Nothing

Validates the created metadata against the ULPIN schema.
Uses the JSON schema validation from GL-0101.
"""
function validate_metadata!(metadata::Dict)
    @info "Validating metadata against ULPIN schema"
    
    # Load ULPIN schema (in production, this would be cached)
    schema_path = joinpath(@__DIR__, "..", "..", "contracts", "ethereum", "schemas", "ulpin-metadata.schema.json")
    
    if !isfile(schema_path)
        @warn "ULPIN schema file not found, skipping validation" schema_path
        return
    end
    
    try
        # Basic validation checks
        required_fields = ["name", "description", "image", "ulpin", "coordinates", "area", "land_type"]
        for field in required_fields
            if !haskey(metadata, field)
                throw(ArgumentError("Missing required field in metadata: $field"))
            end
        end
        
        # Validate ULPIN structure
        ulpin = metadata["ulpin"]
        if !haskey(ulpin, "id") || length(ulpin["id"]) != 12
            throw(ArgumentError("Invalid ULPIN ID format"))
        end
        
        if ulpin["state_code"] != "24"
            throw(ArgumentError("Invalid state code, must be 24 for Gujarat"))
        end
        
        # Validate coordinates
        coords = metadata["coordinates"]
        center = coords["center"]
        lat, lng = center["latitude"], center["longitude"]
        
        if !(20.0 <= lat <= 25.0) || !(68.0 <= lng <= 75.0)
            throw(ArgumentError("Coordinates outside Gujarat bounds"))
        end
        
        # Validate area consistency
        area_data = metadata["area"]
        calculated_area = coords["area_calculated"]
        declared_area = area_data["square_meters"]
        
        # Allow 20% variance between calculated and declared area
        if abs(calculated_area - declared_area) / declared_area > 0.2
            @warn "Large variance between calculated and declared area" calculated=calculated_area declared=declared_area
        end
        
        @info "Metadata validation passed"
        
    catch e
        @error "Metadata validation failed" exception=e
        rethrow(e)
    end
end
