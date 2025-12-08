# Student Performance Factors Analysis Dashboard

An interactive web application built with React and D3.js to visualize and analyze factors affecting student exam performance.

## Features

- **Chart 1: Correlation Analysis** - Heatmap and line charts showing relationships between factors and exam scores
- **Chart 2: Performance Across Categories** - Grouped and stacked bar charts comparing performance across different student backgrounds
- **Chart 3: Factor Interactions** - Grouped bar charts showing how two factors interact to affect performance
- **Chart 4: Impact Ranking** - Horizontal bar chart ranking factors by their impact on performance

## Interactive Features

- Global filters (School Type, Gender, Learning Disabilities, Score Range)
- Cross-chart interactions
- Tooltips and hover effects
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure `StudentPerformanceFactors.csv` is in the `public` folder

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── Chart1Correlation.js
│   ├── Chart2Categorical.js
│   ├── Chart3Interactions.js
│   ├── Chart4Impact.js
│   ├── Dashboard.js
│   ├── FilterPanel.js
│   └── SummaryPanel.js
├── utils/
│   ├── dataLoader.js
│   ├── dataProcessor.js
│   └── colorScales.js
├── App.js
└── index.js
```

## Technologies Used

- React 18
- D3.js 7
- CSS3

## Data

The dashboard uses `StudentPerformanceFactors.csv` which contains 6,378 student records with 19 factors and exam scores.

