# Customer Purchase Pattern Analysis using PCA and SVD

A data analysis project focused on discovering customer purchasing patterns, reducing data dimensionality, generating product recommendations, and identifying potential sales opportunities using **Principal Component Analysis (PCA)** and **Singular Value Decomposition (SVD)**.

## Project Overview

This project analyzes customer purchase history to identify similarities between customers and discover hidden patterns in purchasing behavior.

PCA and SVD are applied to reduce the dimensionality of the customer-product matrix while preserving important information. The extracted patterns are then used to generate product recommendations and identify potential opportunities for increasing sales.

## Objectives

- Analyze customer purchasing behavior.
- Discover relationships between products.
- Reduce data dimensionality using PCA.
- Apply SVD for matrix decomposition and reconstruction.
- Generate personalized product recommendations.
- Identify potential sales opportunities across product departments.
- Evaluate recommendation performance using next-order purchase data.

## Technologies Used

### Backend
- Python
- FastAPI
- NumPy
- Pandas

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

## Project Workflow

The project is divided into the following stages:

1. **Data Loading and Exploration**
   - Load customer purchase history and product metadata.
   - Examine dataset dimensions, missing values, and data distribution.

2. **Purchase Matrix Analysis**
   - Analyze customer purchasing statistics.
   - Calculate product popularity and matrix sparsity.

3. **Covariance and Correlation Analysis**
   - Calculate the covariance matrix.
   - Identify products with positive purchasing relationships.

4. **Principal Component Analysis (PCA)**
   - Calculate eigenvalues and eigenvectors.
   - Analyze explained variance.
   - Reduce the dimensionality of customer data.

5. **Singular Value Decomposition (SVD)**
   - Decompose the customer-product matrix.
   - Reconstruct the matrix using different numbers of components.
   - Evaluate reconstruction error.

6. **Product Recommendation**
   - Generate product recommendations using SVD.
   - Compare recommendations with a popularity-based baseline.

7. **Sales Opportunity Discovery**
   - Identify similar customers using PCA.
   - Analyze department-level purchasing patterns.
   - Discover potential product categories for each customer.

8. **Recommendation Evaluation**
   - Evaluate recommendations using next-order purchase data.
   - Calculate Precision@5.
   - Compare SVD recommendations with the popularity baseline.

## Dataset

The project uses a customer-product purchase matrix containing:

- 1,000 customers
- 200 products
- Historical purchase information
- Next-order purchase information
- Product metadata, including department information

**Dataset Note:** The customer purchase matrices and product metadata are synthetic practice data. Department and aisle metadata are based on real Instacart metadata.

## Project Structure

```text
project/
│
├── back-end/
│   ├── main.py
│   └── api.py
│
├── front-end/
│   ├── public/
│   └── src/
│       └── app/
│
└── README.md
```

## Installation and Execution

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Backend Setup

```bash
cd back-end
pip install numpy pandas fastapi uvicorn
```

Run the backend:

```bash
uvicorn api:app --reload
```

### 3. Frontend Setup

```bash
cd front-end
npm install
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## Evaluation Metrics

The project uses the following metrics:

- **Explained Variance:** Measures how much information is preserved by PCA components.
- **Reconstruction Error:** Measures the difference between the original and reconstructed matrices.
- **Precision@5:** Measures the proportion of recommended products that appear in the customer's next order.
- **Customer Hit Rate:** Measures the percentage of customers who received at least one successful recommendation.

## Key Concepts

- Principal Component Analysis (PCA)
- Singular Value Decomposition (SVD)
- Dimensionality Reduction
- Matrix Reconstruction
- Customer Similarity
- Product Recommendation
- Purchase Pattern Analysis

## License

This project was developed for educational and academic purposes.
