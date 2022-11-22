
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//Script written by Filip Giermek as a part of an Engineering Thesis
//
//Goal: Pre-processing and analysis of SAR images with intent to recognize crop types based on examples
//
// Based on :
//            [1] Google Earth Engine Developers Guides: https://developers.google.com/earth-engine/guides
//            [2] Sentinel-1 SAR Backscatter Analysis Ready Data Preparation in Google Earth Engine: https://github.com/adugnag/gee_s1_ard
//
//28.10.2022 University of Science and Technology in Cracow, Poland
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

//linkers to function scripts from [2]
var wrapper = require('users/adugnagirma/gee_s1_ard:wrapper');
var helper = require('users/adugnagirma/gee_s1_ard:utilities');

//-------------------//
//    PARAMETERS
//-------------------//

var geometry; //empty variable for region of interest 

//function with parameters settings
var parameter_func = function (geometry) {
  var parameter = { 
              //1. Data Selection
              START_DATE: "2021-06-1",
              STOP_DATE: "2021-06-30",
              POLARIZATION:'VVVH',
              ORBIT : 'BOTH',
              GEOMETRY: geometry,
              //2. Additional Border noise correction
              APPLY_ADDITIONAL_BORDER_NOISE_CORRECTION: true,
              //3.Speckle filter
              APPLY_SPECKLE_FILTERING: true,
              SPECKLE_FILTER_FRAMEWORK: 'MULTI',
              SPECKLE_FILTER: 'BOXCAR',
              SPECKLE_FILTER_KERNEL_SIZE: 15,
              SPECKLE_FILTER_NR_OF_IMAGES: 10,
              //4. Radiometric terrain normalization
              APPLY_TERRAIN_FLATTENING: true,
              DEM: ee.Image('USGS/SRTMGL1_003'),
              TERRAIN_FLATTENING_MODEL: 'VOLUME',
              TERRAIN_FLATTENING_ADDITIONAL_LAYOVER_SHADOW_BUFFER: 0,
              //5. Output
              FORMAT : 'DB',
              CLIP_TO_ROI: true,
              SAVE_ASSETS: false
  }
return parameter;
}

//Samples creating
var NOP = 1000;

var oats_points = ee.FeatureCollection.randomPoints(
    {region: oats_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 0)
    });
    
var rye_points = ee.FeatureCollection.randomPoints(
    {region: rye_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 1)
    });
    
var wheat_points = ee.FeatureCollection.randomPoints(
    {region: wheat_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 2)
    });
    
var canola_points = ee.FeatureCollection.randomPoints(
    {region: canola_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 3)
    });
    
var flaxseed_points = ee.FeatureCollection.randomPoints(
    {region: flaxseed_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 4)
    });
    
var triticale_points = ee.FeatureCollection.randomPoints(
    {region: triticale_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 5)
    });
    
var sunflower_points = ee.FeatureCollection.randomPoints(
    {region: sunflower_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 6)
    });
    
var corn_points = ee.FeatureCollection.randomPoints(
    {region: corn_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 7)
    });
    
var potatoes_points = ee.FeatureCollection.randomPoints(
    {region: potatoes_vec, points: NOP, seed: 0, maxError: 1})
    .map(function(f) {
        return f.set('landcover', 8)
    });
    
//merging vectors for roi
var wektory = roi_gmina.merge(canola_vec).merge(flaxseed_vec).merge(oats_vec).merge(rye_vec).merge(triticale_vec).merge(wheat_vec).merge(corn_vec).merge(potatoes_vec).merge(sunflower_vec);

//applying parameters to imported images
var s1_preprocces1 = wrapper.s1_preproc(parameter_func(wektory))
var s1_preprocces2 = wrapper.s1_preproc(parameter_func(roi_gmina));

var s1_1 = s1_preprocces1[0]
s1_preprocces1 = s1_preprocces1[1]

var s1_2 = s1_preprocces2[0]
s1_preprocces2 = s1_preprocces2[1]

//------------//
// VISUALIZE
//------------//

//Visulaization parameters
var visparam = {}

    var s1_preprocces1_view = s1_preprocces1.map(helper.add_ratio_lin).map(helper.lin_to_db2);
    var s1_1_view = s1_1.map(helper.add_ratio_lin).map(helper.lin_to_db2);
    visparam = {bands:['VV','VH','VVVH_ratio'],min: [-20, -25, 1],max: [0, -5, 15]}

    var s1_preprocces2_view = s1_preprocces2.map(helper.add_ratio_lin).map(helper.lin_to_db2);
    var s1_2_view = s1_2.map(helper.add_ratio_lin).map(helper.lin_to_db2);
    visparam = {bands:['VV','VH','VVVH_ratio'],min: [-20, -25, 1],max: [0, -5, 15]}

Map.centerObject(roi_gmina, 12);

//adding processed SAR image to display
Map.addLayer(s1_preprocces2_view.first(), visparam, 'First image in the processed S1 collection', true);

var SAR = s1_preprocces2_view.first();

//reducing an image collection by calculating the mean of all values at each pixel across the stack of all matching bands
var final_1 = s1_preprocces1_view.mean();
var final_2 = s1_preprocces2_view.mean();
var bands = ['VH','VV'];

//merging sample points
var train_merge = oats_points.merge(rye_points).merge(wheat_points).merge(canola_points)
.merge(flaxseed_points).merge(triticale_points).merge(corn_points).merge(sunflower_points).merge(potatoes_points);


////Creating classifier
var points = final_1.select(bands).sampleRegions({
  collection: train_merge,
  properties: ['landcover'],
  scale: 30
}).randomColumn();

//splitting samples for training and testing
var split = 0.8;
var train = points.filter(ee.Filter.lt('random', split));
var test = points.filter(ee.Filter.gte('random', split));

print('Samples n =', points.aggregate_count('.all'));
print('Training n =', train.aggregate_count('.all'));
print('Testing n =', test.aggregate_count('.all'));

//----------------//
//CLASSIFICATION
//----------------//

//Train the classifier
var classifier = ee.Classifier.smileRandomForest(70).train({
  features: train,
  classProperty: 'landcover',
  inputProperties: bands
});

//Run the Classification
var classified = final_2.select(bands).classify(classifier);
var accuracy = classifier.confusionMatrix().accuracy();

// Create a confusion matrix representing resubstitution accuracy.
print('RF- SAR error matrix: ', classifier.confusionMatrix());
print('RF- SAR accuracy: ', accuracy);
print('Training Kappa', classifier.confusionMatrix().kappa());

// Create a validation matrix
print('Validation error matrix: ', test.classify(classifier).errorMatrix('landcover', 'classification'));
print('Validation Overall Accuracy: ', test.classify(classifier).errorMatrix('landcover', 'classification').accuracy());
print('Validation Kappa', test.classify(classifier).errorMatrix('landcover', 'classification').kappa());

//-----------//
//DISPLAY
//-----------//

var Palette =
'<RasterSymbolizer>' +
' <ColorMap type="intervals">' +
'   <ColorMapEntry color="#d2810f" quantity="1" label="oats"/>' +
'   <ColorMapEntry color="#0fe68d" quantity="2" label="rye"/>' +
'   <ColorMapEntry color="#aa4de8" quantity="3" label="wheat"/>' +
'   <ColorMapEntry color="#e23f80" quantity="4" label="canola"/>' +
'   <ColorMapEntry color="#4361ee" quantity="5" label="flaxseed"/>' +
'   <ColorMapEntry color="#d1e83a" quantity="6" label="triticale"/>' +
'   <ColorMapEntry color="#ffff00" quantity="7" label="sunflower"/>' +
'   <ColorMapEntry color="#82EB8C" quantity="8" label="corn"/>' +
'   <ColorMapEntry color="#dda50a" quantity="9" label="potatoes"/>' +
' </ColorMap>' +
'</RasterSymbolizer>';

//applying palette to classified image
var map = ee.Image(classified.sldStyle(Palette));

Map.addLayer(classified.sldStyle(Palette), {}, "SAR Classification");

//Legend 
var palette =['d2810f', '0fe68d', 'aa4de8', 'e23f80', '4361ee', 'd1e83a','ffff00', '82EB8C', 'dda50a'];
var names =['oats', 'rye', 'wheat', 'canola', 'flaxseed','triticale', 'sunflower', 'corn', 'potatoes'];

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

var LegendTitle = ui.Label({
  value: 'Klasyfikacja - Legenda',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
var SecondTitle =  ui.Label({
  value: 'Rodzaje pokrycia terenu',
  style: {
    fontSize: '15px',
    margin: '0 0 4px 0',
    padding: '2px'
  }
});

legend.add(LegendTitle);
legend.add(SecondTitle);

var makeRow = function(color, name) {
  
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  
  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

for (var i = 0; i < 9; i++) {
  legend.add(makeRow(palette[i], names[i]));
}

Map.add(legend);

//exporting product to chosen Google Drive 
Export.image.toDrive({
  image: map,
  description: 'RF_1000_70_milanow',
  region: roi_gmina,
  scale: 10,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    cloudOptimized: true
  }
});
