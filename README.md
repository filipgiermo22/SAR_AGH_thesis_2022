# SAR_AGH_thesis_2022

Script is based on workflow prepared and shared on MIT License from paper <br />  
*Sentinel-1 SAR Backscatter Analysis Ready Data Preparation in Google Earth Engine* <br /> 
links: [Github](https://github.com/adugnag/gee_s1_ard); [Paper](https://www.mdpi.com/2072-4292/13/10/1954) <br /> 
authors: Mullissa, A.; Vollrath, A.; Odongo-Braun, C.; Slagter, B.; Balling, J.; Gou, Y.; Gorelick, N.; Reiche, J.
-------------------------------------------------------------------------------------------------------------------
### Object

1. Script imports Sentinel-1 SAR images with given parameters
2. Pre-processes SAR images and gets median from images collection
3. Randomly generates sample points for further analysis on basis of uploaded polygons of given crop types from region of Canada
4. Image is being classified with Random Forest algorithm
5. Styling is applied to product layer
6. Product is exported

### Workflow Scheme

![diagram](https://user-images.githubusercontent.com/76012392/203328053-68262c6d-a1cd-4980-80a9-d4093d37d8a8.png)

### Product Map

![classified_final](https://user-images.githubusercontent.com/76012392/203330262-b65d5de1-3be3-4f45-b489-b0f3943a45d7.png)

## Conclusion
Further steps should include:
- better precision of source raster data
- script should be written in Python in order to make use of better statistical libraries
- better spatial resolution of SAR images
---------------------------------------------------------------------------------------------------------------------
Filip Giermek Geoinformatics Engineering Thesis 2022 AGH UST Cracow
