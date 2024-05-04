# Spring 2024 DSC 106 Project 3
Aim: doing a simple version of this: https://www.nytimes.com/interactive/2014/06/05/upshot/how-the-recession-reshaped-the-economy-in-255-charts.html

Our Data Set (OWID Energy Data Set)
- OWID Energy Data Set (temporal, country as text indexing): https://github.com/owid/energy-data/blob/master/owid-energy-codebook.csv
    - Textual Data - country names
    - Temporal data on x-axis
    - Create multiple plots depending on what aspects of energy looking at -> go into each plot’s sub-distribution -> zoom in function

Sample Code
- + Line selectable: https://observablehq.com/@d3/multi-line-chart/2?intent=fork 
- + Annotation: https://observablehq.com/@harrystevens/directly-labelling-lines
- + Wave like area in graph: https://observablehq.com/@d3/ridgeline-plot?intent=fork 
- + Interaction https://observablehq.com/@d3/zoomable-sunburst 

Todo:
1. Clean data set, set what each aspects of the data set we would use for (no groupby)
2. Start planning for the schematic of D3 needed, setting up initial frame work
3. Line selectable
4. Annotation
5. Zoom in with animation
6. Wave like graph
7. Category selection?