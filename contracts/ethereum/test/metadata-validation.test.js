const { expect } = require('chai');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

describe('ULPIN NFT Metadata Schema Validation', () => {
  let ajv;
  let ulpinSchema;
  let openSeaSchema;

  before(() => {
    // Initialize AJV with format validation
    ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(ajv);

    // Load schemas
    const ulpinSchemaPath = path.join(__dirname, '../schemas/ulpin-metadata.schema.json');
    const openSeaSchemaPath = path.join(__dirname, '../schemas/opensea-standard.json');
    
    ulpinSchema = JSON.parse(fs.readFileSync(ulpinSchemaPath, 'utf8'));
    openSeaSchema = JSON.parse(fs.readFileSync(openSeaSchemaPath, 'utf8'));
  });

  describe('Schema Loading and Compilation', () => {
    it('should load ULPIN schema without errors', () => {
      expect(ulpinSchema).to.be.an('object');
      expect(ulpinSchema.title).to.equal('ULPIN Land Parcel NFT Metadata Schema');
    });

    it('should load OpenSea schema without errors', () => {
      expect(openSeaSchema).to.be.an('object');
      expect(openSeaSchema.title).to.equal('OpenSea ERC-721 Metadata Standard');
    });

    it('should compile ULPIN schema successfully', () => {
      const validate = ajv.compile(ulpinSchema);
      expect(validate).to.be.a('function');
    });

    it('should compile OpenSea schema successfully', () => {
      const validate = ajv.compile(openSeaSchema);
      expect(validate).to.be.a('function');
    });
  });

  describe('ULPIN Metadata Validation', () => {
    let validate;

    before(() => {
      validate = ajv.compile(ulpinSchema);
    });

    describe('Valid Metadata', () => {
      it('should validate complete agricultural land metadata', () => {
        const validMetadata = {
          name: 'ULPIN-240123456789-ABC123',
          description: 'Premium agricultural land parcel of 2.5 hectares in Bavla village, Ahmedabad district.',
          image: 'ipfs://QmSatelliteImagePrimary123ABC',
          external_url: 'https://landrecords.gujarat.gov.in/parcel/ULPIN-240123456789-ABC123',
          
          ulpin: {
            id: '240123456789',
            state_code: '24',
            district_code: '01',
            village_code: '123456',
            survey_number: '123/1'
          },
          
          coordinates: {
            center: {
              latitude: 22.8461,
              longitude: 72.3809
            },
            boundary: [
              { latitude: 22.8465, longitude: 72.3805 },
              { latitude: 22.8465, longitude: 72.3815 },
              { latitude: 22.8455, longitude: 72.3815 },
              { latitude: 22.8455, longitude: 72.3805 },
              { latitude: 22.8465, longitude: 72.3805 }
            ],
            area_calculated: 25000
          },
          
          area: {
            hectares: 2.5,
            acres: 6.18,
            square_meters: 25000,
            unit: 'hectares'
          },
          
          land_type: {
            primary_use: 'agricultural',
            soil_type: 'black_cotton',
            irrigation: {
              available: true,
              source: 'canal',
              quality: 'good'
            }
          },
          
          ownership: {
            type: 'private',
            rights: 'full_ownership',
            encumbrance: false,
            mutation_count: 2
          },
          
          satellite_imagery: {
            primary_image: {
              ipfs_hash: 'QmSatelliteImagePrimary123ABC',
              capture_date: '2024-03-15',
              resolution: 1.0,
              satellite_source: 'sentinel-2'
            }
          },
          
          administrative: {
            state: 'Gujarat',
            district: 'Ahmedabad',
            taluka: 'Bavla',
            village: 'Bavla',
            pincode: '382220'
          },
          
          attributes: [
            { trait_type: 'Land Type', value: 'Agricultural' },
            { trait_type: 'Soil Type', value: 'Black Cotton' },
            { trait_type: 'District', value: 'Ahmedabad' },
            { trait_type: 'Area (Hectares)', value: 2.5, display_type: 'number' }
          ],
          
          blockchain: {
            network: 'polygon',
            contract_address: '0x1234567890123456789012345678901234567890',
            token_id: '1',
            ipfs_metadata: 'ipfs://QmMetadataHash123'
          }
        };

        const isValid = validate(validMetadata);
        if (!isValid) {
          console.log('Validation errors:', validate.errors);
        }
        expect(isValid).to.be.true;
      });

      it('should validate minimal required fields', () => {
        const minimalMetadata = {
          name: 'ULPIN-240234567890-XYZ789',
          description: 'Minimal land parcel metadata',
          image: 'ipfs://QmMinimalImageHash456',
          
          ulpin: {
            id: '240234567890',
            state_code: '24',
            district_code: '02',
            village_code: '234567',
            survey_number: '456'
          },
          
          coordinates: {
            center: {
              latitude: 23.0225,
              longitude: 72.5714
            },
            boundary: [
              { latitude: 23.025, longitude: 72.57 },
              { latitude: 23.025, longitude: 72.575 },
              { latitude: 23.02, longitude: 72.575 },
              { latitude: 23.02, longitude: 72.57 },
              { latitude: 23.025, longitude: 72.57 }
            ]
          },
          
          area: {
            hectares: 1.0,
            unit: 'hectares'
          },
          
          land_type: {
            primary_use: 'residential',
            soil_type: 'sandy'
          },
          
          administrative: {
            district: 'Surat',
            taluka: 'Bardoli',
            village: 'Bardoli'
          },
          
          blockchain: {
            network: 'mumbai',
            contract_address: '0x0987654321098765432109876543210987654321'
          }
        };

        const isValid = validate(minimalMetadata);
        if (!isValid) {
          console.log('Validation errors:', validate.errors);
        }
        expect(isValid).to.be.true;
      });
    });

    describe('Invalid Metadata', () => {
      it('should reject metadata missing required fields', () => {
        const invalidMetadata = {
          name: 'ULPIN-240123456789-ABC123',
          description: 'Missing required fields'
          // Missing: image, ulpin, coordinates, area, land_type
        };

        const isValid = validate(invalidMetadata);
        expect(isValid).to.be.false;
        expect(validate.errors).to.have.length.at.least(1);
      });

      it('should reject invalid ULPIN name format', () => {
        const invalidMetadata = {
          name: 'INVALID-FORMAT',
          description: 'Invalid ULPIN name format',
          image: 'ipfs://QmTest123',
          ulpin: {
            id: '240123456789',
            state_code: '24',
            district_code: '01',
            village_code: '123456',
            survey_number: '123'
          },
          coordinates: {
            center: { latitude: 22.8461, longitude: 72.3809 },
            boundary: [
              { latitude: 22.84, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.38 }
            ]
          },
          area: { hectares: 1.0, unit: 'hectares' },
          land_type: { primary_use: 'agricultural', soil_type: 'alluvial' },
          administrative: { district: 'Test', taluka: 'Test', village: 'Test' },
          blockchain: { network: 'polygon', contract_address: '0x1234567890123456789012345678901234567890' }
        };

        const isValid = validate(invalidMetadata);
        expect(isValid).to.be.false;
      });

      it('should reject coordinates outside Gujarat bounds', () => {
        const invalidMetadata = {
          name: 'ULPIN-240123456789-ABC123',
          description: 'Coordinates outside Gujarat',
          image: 'ipfs://QmTest123',
          ulpin: {
            id: '240123456789',
            state_code: '24',
            district_code: '01',
            village_code: '123456',
            survey_number: '123'
          },
          coordinates: {
            center: { latitude: 19.0, longitude: 77.0 }, // Outside Gujarat bounds
            boundary: [
              { latitude: 19.0, longitude: 77.0 },
              { latitude: 19.1, longitude: 77.0 },
              { latitude: 19.1, longitude: 77.1 },
              { latitude: 19.0, longitude: 77.1 },
              { latitude: 19.0, longitude: 77.0 }
            ]
          },
          area: { hectares: 1.0, unit: 'hectares' },
          land_type: { primary_use: 'agricultural', soil_type: 'alluvial' },
          administrative: { district: 'Test', taluka: 'Test', village: 'Test' },
          blockchain: { network: 'polygon', contract_address: '0x1234567890123456789012345678901234567890' }
        };

        const isValid = validate(invalidMetadata);
        expect(isValid).to.be.false;
      });

      it('should reject invalid IPFS hash format', () => {
        const invalidMetadata = {
          name: 'ULPIN-240123456789-ABC123',
          description: 'Invalid IPFS hash',
          image: 'ipfs://invalid-hash-format',
          ulpin: {
            id: '240123456789',
            state_code: '24',
            district_code: '01',
            village_code: '123456',
            survey_number: '123'
          },
          coordinates: {
            center: { latitude: 22.8461, longitude: 72.3809 },
            boundary: [
              { latitude: 22.84, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.38 }
            ]
          },
          area: { hectares: 1.0, unit: 'hectares' },
          land_type: { primary_use: 'agricultural', soil_type: 'alluvial' },
          administrative: { district: 'Test', taluka: 'Test', village: 'Test' },
          blockchain: { network: 'polygon', contract_address: '0x1234567890123456789012345678901234567890' },
          satellite_imagery: {
            primary_image: {
              ipfs_hash: 'invalid-hash',
              capture_date: '2024-03-15',
              resolution: 1.0,
              satellite_source: 'sentinel-2'
            }
          }
        };

        const isValid = validate(invalidMetadata);
        expect(isValid).to.be.false;
      });

      it('should reject non-Gujarat state code', () => {
        const invalidMetadata = {
          name: 'ULPIN-250123456789-ABC123',
          description: 'Wrong state code',
          image: 'ipfs://QmTest123',
          ulpin: {
            id: '250123456789',
            state_code: '25', // Should be '24' for Gujarat
            district_code: '01',
            village_code: '123456',
            survey_number: '123'
          },
          coordinates: {
            center: { latitude: 22.8461, longitude: 72.3809 },
            boundary: [
              { latitude: 22.84, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.38 },
              { latitude: 22.85, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.39 },
              { latitude: 22.84, longitude: 72.38 }
            ]
          },
          area: { hectares: 1.0, unit: 'hectares' },
          land_type: { primary_use: 'agricultural', soil_type: 'alluvial' },
          administrative: { district: 'Test', taluka: 'Test', village: 'Test' },
          blockchain: { network: 'polygon', contract_address: '0x1234567890123456789012345678901234567890' }
        };

        const isValid = validate(invalidMetadata);
        expect(isValid).to.be.false;
      });
    });
  });

  describe('OpenSea Compatibility', () => {
    let openSeaValidate;

    before(() => {
      openSeaValidate = ajv.compile(openSeaSchema);
    });

    it('should validate ULPIN metadata against OpenSea standard', () => {
      const ulpinMetadata = {
        name: 'ULPIN-240123456789-ABC123',
        description: 'Agricultural land parcel in Gujarat',
        image: 'ipfs://QmSatelliteImageHash123',
        external_url: 'https://landrecords.gujarat.gov.in/parcel/ULPIN-240123456789-ABC123',
        background_color: '2E8B57',
        attributes: [
          { trait_type: 'Land Type', value: 'Agricultural' },
          { trait_type: 'District', value: 'Ahmedabad' },
          { trait_type: 'Area (Hectares)', value: 2.5, display_type: 'number' },
          { trait_type: 'Irrigation Available', value: true }
        ]
      };

      const isValid = openSeaValidate(ulpinMetadata);
      if (!isValid) {
        console.log('OpenSea validation errors:', openSeaValidate.errors);
      }
      expect(isValid).to.be.true;
    });
  });

  describe('Specific Field Validations', () => {
    let validate;

    before(() => {
      validate = ajv.compile(ulpinSchema);
    });

    it('should validate Gujarat district codes', () => {
      const testCases = [
        { district_code: '01', should_pass: true, district: 'Ahmedabad' },
        { district_code: '02', should_pass: true, district: 'Surat' },
        { district_code: '15', should_pass: true, district: 'Rajkot' },
        { district_code: '33', should_pass: true, district: 'Tapi' },
        { district_code: '99', should_pass: true, district: 'Invalid but format OK' }
      ];

      testCases.forEach(({ district_code, should_pass, district }) => {
        const metadata = createValidMetadata();
        metadata.ulpin.district_code = district_code;
        metadata.administrative.district = district;

        const isValid = validate(metadata);
        if (should_pass) {
          expect(isValid).to.be.true;
        } else {
          expect(isValid).to.be.false;
        }
      });
    });

    it('should validate survey number formats', () => {
      const testCases = [
        { survey_number: '123', should_pass: true },
        { survey_number: '456/1', should_pass: true },
        { survey_number: '789/12', should_pass: true },
        { survey_number: '1', should_pass: true },
        { survey_number: '9999', should_pass: true },
        { survey_number: '123/123', should_pass: false },
        { survey_number: 'ABC', should_pass: false },
        { survey_number: '12345', should_pass: false }
      ];

      testCases.forEach(({ survey_number, should_pass }) => {
        const metadata = createValidMetadata();
        metadata.ulpin.survey_number = survey_number;

        const isValid = validate(metadata);
        if (should_pass) {
          expect(isValid).to.be.true;
        } else {
          expect(isValid).to.be.false;
        }
      });
    });

    it('should validate land use enums', () => {
      const validUses = ['agricultural', 'residential', 'commercial', 'industrial', 'forest', 'water_body', 'government', 'religious'];
      const invalidUses = ['invalid', 'mixed', 'other'];

      validUses.forEach(use => {
        const metadata = createValidMetadata();
        metadata.land_type.primary_use = use;
        
        const isValid = validate(metadata);
        expect(isValid).to.be.true;
      });

      invalidUses.forEach(use => {
        const metadata = createValidMetadata();
        metadata.land_type.primary_use = use;
        
        const isValid = validate(metadata);
        expect(isValid).to.be.false;
      });
    });

    it('should validate soil type enums', () => {
      const validSoils = ['alluvial', 'black_cotton', 'red', 'laterite', 'sandy', 'clayey', 'loamy'];
      const invalidSoils = ['clay', 'sand', 'unknown'];

      validSoils.forEach(soil => {
        const metadata = createValidMetadata();
        metadata.land_type.soil_type = soil;
        
        const isValid = validate(metadata);
        expect(isValid).to.be.true;
      });

      invalidSoils.forEach(soil => {
        const metadata = createValidMetadata();
        metadata.land_type.soil_type = soil;
        
        const isValid = validate(metadata);
        expect(isValid).to.be.false;
      });
    });
  });

  // Helper function to create valid metadata for testing
  function createValidMetadata() {
    return {
      name: 'ULPIN-240123456789-ABC123',
      description: 'Test land parcel',
      image: 'ipfs://QmTest123',
      ulpin: {
        id: '240123456789',
        state_code: '24',
        district_code: '01',
        village_code: '123456',
        survey_number: '123'
      },
      coordinates: {
        center: { latitude: 22.8461, longitude: 72.3809 },
        boundary: [
          { latitude: 22.84, longitude: 72.38 },
          { latitude: 22.85, longitude: 72.38 },
          { latitude: 22.85, longitude: 72.39 },
          { latitude: 22.84, longitude: 72.39 },
          { latitude: 22.84, longitude: 72.38 }
        ]
      },
      area: { hectares: 1.0, unit: 'hectares' },
      land_type: { primary_use: 'agricultural', soil_type: 'alluvial' },
      administrative: { district: 'Ahmedabad', taluka: 'Test', village: 'Test' },
      blockchain: { network: 'polygon', contract_address: '0x1234567890123456789012345678901234567890' }
    };
  }
});
