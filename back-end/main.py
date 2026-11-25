from pathlib import Path
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent

DATASET_DIRS = [
    BASE_DIR,
    BASE_DIR / "dataset",
    BASE_DIR / "instacart_metadata_and_practice_dataset"
]

FILES = {
    "X": "DEMO_SYNTHETIC_X_prior.csv",
    "Y": "DEMO_SYNTHETIC_Y_next_order.csv",
    "products": "DEMO_SYNTHETIC_products.csv"
}


def find_dataset_file(filename):
    for directory in DATASET_DIRS:
        file_path = directory / filename

        if file_path.exists():
            return file_path

    raise FileNotFoundError(
        f"Dataset file not found: {filename}"
    )


def load_project_data():
    paths = {
        name: find_dataset_file(filename)
        for name, filename in FILES.items()
    }

    X_df = pd.read_csv(paths["X"])
    Y_df = pd.read_csv(paths["Y"])
    products_df = pd.read_csv(paths["products"])

    required_columns = {
        "X": "user_id",
        "Y": "user_id"
    }

    for name, column in required_columns.items():
        dataframe = X_df if name == "X" else Y_df

        if column not in dataframe.columns:
            raise ValueError(
                f"{name} must contain the {column} column"
            )

    if "product_id" not in products_df.columns:
        raise ValueError(
            "Products file must contain product_id"
        )

    if X_df["user_id"].duplicated().any():
        raise ValueError("Duplicate user IDs found in X")

    if Y_df["user_id"].duplicated().any():
        raise ValueError("Duplicate user IDs found in Y")

    if products_df["product_id"].duplicated().any():
        raise ValueError("Duplicate product IDs found")

    X_users = set(X_df["user_id"])
    Y_users = set(Y_df["user_id"])

    if X_users != Y_users:
        raise ValueError(
            "Customer IDs in X and Y do not match"
        )

    X_product_columns = [
        column for column in X_df.columns
        if column != "user_id"
    ]

    Y_product_columns = [
        column for column in Y_df.columns
        if column != "user_id"
    ]

    if X_product_columns != Y_product_columns:
        raise ValueError(
            "Product columns in X and Y do not match"
        )

    if len(X_product_columns) != len(products_df):
        raise ValueError(
            "Number of product columns does not match products data"
        )

    X = X_df[X_product_columns]
    Y = Y_df[Y_product_columns]

    if X.isnull().values.any() or Y.isnull().values.any():
        raise ValueError("Missing values found in purchase matrices")

    if not X.isin([0, 1]).values.all():
        raise ValueError("X must contain only binary values")

    if not Y.isin([0, 1]).values.all():
        raise ValueError("Y must contain only binary values")

    if X.shape[0] != Y.shape[0]:
        raise ValueError(
            "Customer count in X and Y does not match"
        )

    return {
        "X": X,
        "Y": Y,
        "X_df": X_df,
        "Y_df": Y_df,
        "products": products_df,
        "customer_count": len(X_users),
        "product_count": len(X_product_columns),
        "X_shape": list(X.shape),
        "Y_shape": list(Y.shape)
    }


def get_step_one_summary():
    data = load_project_data()

    X = data["X"]
    Y = data["Y"]
    products = data["products"]

    return {
        "customer_count": data["customer_count"],
        "product_count": data["product_count"],
        "X_shape": data["X_shape"],
        "Y_shape": data["Y_shape"],
        "X_missing_values": int(X.isnull().sum().sum()),
        "Y_missing_values": int(Y.isnull().sum().sum()),
        "X_is_binary": bool(X.isin([0, 1]).values.all()),
        "Y_is_binary": bool(Y.isin([0, 1]).values.all()),
        "X_zero_percentage": round(
            float((X == 0).sum().sum() / X.size * 100), 2
        ),
        "Y_zero_percentage": round(
            float((Y == 0).sum().sum() / Y.size * 100), 2
        ),
        "products_columns": products.columns.tolist(),
        "products_preview": products.head(10).fillna("").to_dict(
            orient="records"
        )
    }

def get_step_two_summary():
    data = load_project_data()

    X = data["X"]

    product_purchase_counts = X.sum(axis=0).sort_values(
        ascending=False
    )

    customer_purchase_counts = X.sum(axis=1)

    top_five_products = [
        {
            "product_column": str(product_column),
            "customer_count": int(customer_count)
        }
        for product_column, customer_count
        in product_purchase_counts.head(5).items()
    ]

    total_cells = X.shape[0] * X.shape[1]
    zero_cells = int((X == 0).sum().sum())

    return {
        "matrix_shape": list(X.shape),
        "customer_count": int(X.shape[0]),
        "product_count": int(X.shape[1]),
        "is_expected_shape": X.shape == (1000, 200),
        "zero_percentage": round(
            zero_cells / total_cells * 100, 2
        ),
        "one_percentage": round(
            (X == 1).sum().sum() / total_cells * 100, 2
        ),
        "top_five_products": top_five_products,
        "average_products_per_customer": round(
            float(customer_purchase_counts.mean()), 2
        ),
        "minimum_products_per_customer": int(
            customer_purchase_counts.min()
        ),
        "maximum_products_per_customer": int(
            customer_purchase_counts.max()
        )
    }



def get_step_three_summary():
    data = load_project_data()

    X = data["X"].to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    if customer_count < 2:
        raise ValueError(
            "At least two customers are required for covariance calculation"
        )

    product_means = np.mean(X, axis=0)

    X_centered = X - product_means

    covariance_matrix = (
        X_centered.T @ X_centered
    ) / (customer_count - 1)

    covariance_numpy = np.cov(X, rowvar=False)

    max_covariance_difference = np.max(
        np.abs(covariance_matrix - covariance_numpy)
    )

    standard_deviations = np.sqrt(
        np.diag(covariance_matrix)
    )

    denominator = np.outer(
        standard_deviations,
        standard_deviations
    )

    correlation_matrix = np.zeros_like(covariance_matrix)

    np.divide(
        covariance_matrix,
        denominator,
        out=correlation_matrix,
        where=denominator != 0
    )

    np.fill_diagonal(
        correlation_matrix,
        np.where(standard_deviations > 0, 1.0, 0.0)
    )

    upper_indices = np.triu_indices(
        product_count,
        k=1
    )

    pair_correlations = correlation_matrix[upper_indices]

    pair_covariances = covariance_matrix[upper_indices]

    positive_indices = np.where(
        pair_correlations > 0
    )[0]

    sorted_indices = positive_indices[
        np.argsort(pair_correlations[positive_indices])[::-1]
    ]

    top_five_pairs = []

    for index in sorted_indices[:5]:
        product_a_index = upper_indices[0][index]
        product_b_index = upper_indices[1][index]

        top_five_pairs.append({
            "product_a": str(data["X"].columns[product_a_index]),
            "product_b": str(data["X"].columns[product_b_index]),
            "covariance": round(
                float(pair_covariances[index]), 6
            ),
            "correlation": round(
                float(pair_correlations[index]), 6
            )
        })

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "centered_matrix_shape": list(X_centered.shape),
        "covariance_shape": list(covariance_matrix.shape),
        "correlation_shape": list(correlation_matrix.shape),
        "max_covariance_difference": float(
            max_covariance_difference
        ),
        "covariance_matches_numpy": bool(
            np.allclose(
                covariance_matrix,
                covariance_numpy,
                atol=1e-10
            )
        ),
        "top_five_positive_pairs": top_five_pairs
    }



def get_step_four_summary():
    data = load_project_data()

    X = data["X"].to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    product_means = np.mean(X, axis=0)

    X_centered = X - product_means

    covariance_matrix = (
        X_centered.T @ X_centered
    ) / (customer_count - 1)

    eigenvalues, eigenvectors = np.linalg.eigh(
        covariance_matrix
    )

    sorted_indices = np.argsort(eigenvalues)[::-1]

    eigenvalues = eigenvalues[sorted_indices]
    eigenvectors = eigenvectors[:, sorted_indices]

    eigenvalues = np.maximum(eigenvalues, 0)

    total_variance = np.sum(eigenvalues)

    if total_variance <= 0:
        raise ValueError(
            "Total variance must be greater than zero for PCA"
        )

    explained_variance_ratio = (
        eigenvalues / total_variance
    )

    cumulative_variance_ratio = np.cumsum(
        explained_variance_ratio
    )

    required_components = int(
        np.searchsorted(
            cumulative_variance_ratio,
            0.90
        ) + 1
    )

    component_counts = [5, 10, 20]

    reduced_dimensions = {}

    for component_count in component_counts:
        actual_count = min(
            component_count,
            product_count
        )

        selected_vectors = eigenvectors[
            :, :actual_count
        ]

        reduced_matrix = (
            X_centered @ selected_vectors
        )

        reduced_dimensions[str(component_count)] = {
            "shape": list(reduced_matrix.shape),
            "explained_variance": round(
                float(cumulative_variance_ratio[actual_count - 1]),
                6
            )
        }

    first_two_components = eigenvectors[:, :2]

    projected_data = (
        X_centered @ first_two_components
    )

    scatter_points = [
        {
            "customer_index": index + 1,
            "pc1": round(float(point[0]), 6),
            "pc2": round(float(point[1]), 6)
        }
        for index, point in enumerate(projected_data)
    ]

    explained_variance_data = [
        {
            "component": index + 1,
            "explained_variance": round(
                float(explained_variance_ratio[index] * 100),
                4
            ),
            "cumulative_variance": round(
                float(cumulative_variance_ratio[index] * 100),
                4
            )
        }
        for index in range(product_count)
    ]

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "centered_matrix_shape": list(X_centered.shape),
        "covariance_shape": list(covariance_matrix.shape),
        "eigenvalues_count": int(len(eigenvalues)),
        "required_components_for_90_percent": required_components,
        "explained_variance_data": explained_variance_data,
        "reduced_dimensions": reduced_dimensions,
        "scatter_points": scatter_points
    }


def get_step_five_summary():
    data = load_project_data()

    X = data["X"].to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    U, singular_values, VT = np.linalg.svd(
        X,
        full_matrices=False
    )

    component_counts = [5, 10, 20, 40]

    reconstruction_results = []

    total_energy = np.sum(singular_values ** 2)
    original_norm = np.linalg.norm(X, ord="fro")

    for k in component_counts:
        U_k = U[:, :k]
        S_k = np.diag(singular_values[:k])
        VT_k = VT[:k, :]

        reconstructed_matrix = U_k @ S_k @ VT_k

        reconstruction_error = (
            np.linalg.norm(
                X - reconstructed_matrix,
                ord="fro"
            ) / original_norm
        )

        retained_energy = (
            np.sum(singular_values[:k] ** 2) / total_energy
        )

        reconstruction_results.append({
            "components": k,
            "reconstruction_error": round(
                float(reconstruction_error), 6
            ),
            "retained_energy": round(
                float(retained_energy * 100), 4
            ),
            "reconstructed_shape": list(
                reconstructed_matrix.shape
            )
        })

    X_centered = X - np.mean(X, axis=0)

    U_centered, centered_singular_values, VT_centered = (
        np.linalg.svd(
            X_centered,
            full_matrices=False
        )
    )

    covariance_matrix = (
        X_centered.T @ X_centered
    ) / (customer_count - 1)

    covariance_eigenvalues = np.linalg.eigvalsh(
        covariance_matrix
    )

    covariance_eigenvalues = np.sort(
        covariance_eigenvalues
    )[::-1]

    singular_values_squared = (
        centered_singular_values ** 2
    ) / (customer_count - 1)

    max_eigenvalue_difference = np.max(
        np.abs(
            covariance_eigenvalues - singular_values_squared
        )
    )

    singular_values_data = [
        {
            "component": index + 1,
            "singular_value": round(float(value), 6)
        }
        for index, value in enumerate(singular_values)
    ]

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "original_matrix_shape": list(X.shape),
        "singular_values_count": int(len(singular_values)),
        "singular_values_data": singular_values_data,
        "reconstruction_results": reconstruction_results,
        "centered_svd_comparison": {
            "max_eigenvalue_difference": round(
                float(max_eigenvalue_difference), 10
            ),
            "comparison_passed": bool(
                np.allclose(
                    covariance_eigenvalues,
                    singular_values_squared,
                    rtol=1e-5,
                    atol=1e-8
                )
            )
        }
    }


def get_step_six_summary():
    data = load_project_data()

    X_df = data["X"]
    X = X_df.to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    component_counts = [5, 10, 20, 40]
    selected_k = 20

    U, singular_values, VT = np.linalg.svd(
        X,
        full_matrices=False
    )

    popularity_scores = np.sum(X, axis=0)

    popularity_order = np.argsort(
        popularity_scores
    )[::-1]

    recommendations_by_k = {}

    for k in component_counts:
        actual_k = min(k, len(singular_values))

        U_k = U[:, :actual_k]
        S_k = np.diag(singular_values[:actual_k])
        VT_k = VT[:actual_k, :]

        reconstructed_matrix = U_k @ S_k @ VT_k

        customer_recommendations = []

        for customer_index in range(min(10, customer_count)):
            purchased_mask = X[customer_index] > 0

            predicted_scores = reconstructed_matrix[
                customer_index
            ].copy()

            predicted_scores[purchased_mask] = -np.inf

            recommended_indices = np.argsort(
                predicted_scores
            )[::-1][:5]

            recommendations = [
                {
                    "product_id": str(X_df.columns[index]),
                    "score": round(
                        float(predicted_scores[index]), 6
                    )
                }
                for index in recommended_indices
            ]

            customer_recommendations.append({
                "customer_id": customer_index + 1,
                "purchased_products_count": int(
                    np.sum(purchased_mask)
                ),
                "recommendations": recommendations
            })

        recommendations_by_k[str(k)] = (
            customer_recommendations
        )

    baseline_recommendations = []

    for customer_index in range(min(10, customer_count)):
        purchased_mask = X[customer_index] > 0

        recommended_indices = [
            index
            for index in popularity_order
            if not purchased_mask[index]
        ][:5]

        recommendations = [
            {
                "product_id": str(X_df.columns[index]),
                "popularity": int(popularity_scores[index])
            }
            for index in recommended_indices
        ]

        baseline_recommendations.append({
            "customer_id": customer_index + 1,
            "purchased_products_count": int(
                np.sum(purchased_mask)
            ),
            "recommendations": recommendations
        })

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "customers_evaluated": min(10, customer_count),
        "recommendation_count": 5,
        "selected_k": selected_k,
        "component_counts": component_counts,
        "recommendations_by_k": recommendations_by_k,
        "popularity_baseline": baseline_recommendations
    }

def get_step_seven_summary():
    data = load_project_data()

    X_df = data["X"]
    products = data["products"]

    X = X_df.to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    products = products.copy()

    products["product_id"] = products["product_id"].astype(int)

    products["name_suffix"] = (
        products["product_name"]
        .str.extract(r"_(\d+)$")[0]
        .astype(int)
    )

    if not np.array_equal(
        products["product_id"].to_numpy(),
        products["name_suffix"].to_numpy()
    ):
        raise ValueError(
            "Product IDs do not match product name suffixes."
        )

    product_columns = [
        f"product_{product_id:03d}"
        for product_id in products["product_id"]
    ]

    if set(product_columns) != set(X_df.columns):
        raise ValueError(
            "Product metadata does not match purchase matrix columns."
        )

    products = products.set_index("product_id")

    departments = sorted(
        products["department"].unique().tolist()
    )

    department_to_index = {
        department: index
        for index, department in enumerate(departments)
    }

    department_matrix = np.zeros(
        (customer_count, len(departments)),
        dtype=np.int8
    )

    for product_id, product in products.iterrows():
        column_name = f"product_{product_id:03d}"

        department_index = department_to_index[
            product["department"]
        ]

        purchased = (
            X_df[column_name].to_numpy() > 0
        )

        department_matrix[:, department_index] = np.maximum(
            department_matrix[:, department_index],
            purchased.astype(np.int8)
        )

    product_means = np.mean(X, axis=0)

    X_centered = X - product_means

    covariance_matrix = (
        X_centered.T @ X_centered
    ) / (customer_count - 1)

    eigenvalues, eigenvectors = np.linalg.eigh(
        covariance_matrix
    )

    sorted_indices = np.argsort(eigenvalues)[::-1]

    eigenvectors = eigenvectors[:, sorted_indices]

    pca_component_count = min(20, product_count)

    selected_vectors = eigenvectors[
        :, :pca_component_count
    ]

    projected_customers = X_centered @ selected_vectors

    neighbors_count = min(20, customer_count - 1)

    threshold = 0.70

    opportunities_by_customer = []

    for customer_index in range(customer_count):

        distances = np.linalg.norm(
            projected_customers - projected_customers[customer_index],
            axis=1
        )

        distances[customer_index] = np.inf

        nearest_indices = np.argsort(
            distances
        )[:neighbors_count]

        neighbors_department_data = department_matrix[
            nearest_indices
        ]

        department_purchase_counts = np.sum(
            neighbors_department_data,
            axis=0
        )

        department_percentages = (
            department_purchase_counts / neighbors_count
        )

        customer_departments = department_matrix[
            customer_index
        ]

        opportunities = []

        for department_index, department in enumerate(departments):

            if customer_departments[department_index] == 1:
                continue

            percentage = department_percentages[
                department_index
            ]

            if percentage >= threshold:

                opportunities.append({
                    "department": department,
                    "customer_count": int(
                        department_purchase_counts[department_index]
                    ),
                    "total_neighbors": int(neighbors_count),
                    "percentage": round(
                        float(percentage * 100), 2
                    )
                })

        opportunities.sort(
            key=lambda item: item["percentage"],
            reverse=True
        )

        top_opportunities = opportunities[:3]

        nearest_customers = [
            {
                "customer_id": int(index + 1),
                "distance": round(
                    float(distances[index]), 6
                )
            }
            for index in nearest_indices
        ]

        opportunities_by_customer.append({
            "customer_id": int(customer_index + 1),
            "neighbors": nearest_customers,
            "opportunities": top_opportunities
        })

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "department_count": int(len(departments)),
        "departments": departments,
        "pca_components": int(pca_component_count),
        "neighbors_count": int(neighbors_count),
        "threshold_percent": 70,
        "department_matrix_shape": list(
            department_matrix.shape
        ),
        "opportunities_by_customer": opportunities_by_customer
    }


def get_step_eight_summary():
    data = load_project_data()

    X_df = data["X"]
    Y_df = data["Y"]
    products = data["products"].copy()

    X = X_df.to_numpy(dtype=np.float64)
    Y = Y_df.to_numpy(dtype=np.float64)

    customer_count, product_count = X.shape

    if X.shape != Y.shape:
        raise ValueError("X and Y matrices must have the same shape.")

    if not np.array_equal(X_df.columns, Y_df.columns):
        raise ValueError("X and Y product columns do not match.")

    recommendation_count = min(5, product_count)
    component_counts = [5, 10, 20, 40]

    U, singular_values, VT = np.linalg.svd(
        X,
        full_matrices=False
    )

    svd_results = []

    for k in component_counts:
        actual_k = min(k, len(singular_values))

        U_k = U[:, :actual_k]
        S_k = np.diag(singular_values[:actual_k])
        VT_k = VT[:actual_k, :]

        reconstructed_matrix = U_k @ S_k @ VT_k

        total_hits = 0
        customers_with_hits = 0

        for customer_index in range(customer_count):
            purchased_mask = X[customer_index] > 0

            predicted_scores = reconstructed_matrix[
                customer_index
            ].copy()

            predicted_scores[purchased_mask] = -np.inf

            recommended_indices = np.argsort(
                predicted_scores
            )[::-1][:recommendation_count]

            actual_next_order = Y[customer_index] > 0

            hits = int(
                np.sum(actual_next_order[recommended_indices])
            )

            total_hits += hits

            if hits > 0:
                customers_with_hits += 1

        total_recommendations = (
            customer_count * recommendation_count
        )

        precision_at_5 = (
            total_hits / total_recommendations
            if total_recommendations > 0
            else 0
        )

        customer_hit_rate = (
            customers_with_hits / customer_count
            if customer_count > 0
            else 0
        )

        svd_results.append({
            "k": int(k),
            "precision_at_5": round(
                float(precision_at_5 * 100), 2
            ),
            "total_hits": int(total_hits),
            "total_recommendations": int(
                total_recommendations
            ),
            "customers_with_hits": int(
                customers_with_hits
            ),
            "customer_hit_rate": round(
                float(customer_hit_rate * 100), 2
            )
        })

    popularity_scores = np.sum(X, axis=0)

    popularity_order = np.argsort(
        popularity_scores
    )[::-1]

    baseline_hits = 0
    baseline_customers_with_hits = 0

    for customer_index in range(customer_count):
        purchased_mask = X[customer_index] > 0

        recommended_indices = [
            index
            for index in popularity_order
            if not purchased_mask[index]
        ][:recommendation_count]

        actual_next_order = Y[customer_index] > 0

        hits = int(
            np.sum(actual_next_order[recommended_indices])
        )

        baseline_hits += hits

        if hits > 0:
            baseline_customers_with_hits += 1

    total_recommendations = (
        customer_count * recommendation_count
    )

    baseline_precision = (
        baseline_hits / total_recommendations
        if total_recommendations > 0
        else 0
    )

    baseline_customer_hit_rate = (
        baseline_customers_with_hits / customer_count
        if customer_count > 0
        else 0
    )

    baseline_result = {
        "precision_at_5": round(
            float(baseline_precision * 100), 2
        ),
        "total_hits": int(baseline_hits),
        "total_recommendations": int(
            total_recommendations
        ),
        "customers_with_hits": int(
            baseline_customers_with_hits
        ),
        "customer_hit_rate": round(
            float(baseline_customer_hit_rate * 100), 2
        )
    }

    products["product_id"] = products[
        "product_id"
    ].astype(int)

    product_to_department = {}

    for _, product in products.iterrows():
        product_id = int(product["product_id"])

        column_name = f"product_{product_id:03d}"

        if column_name not in X_df.columns:
            raise ValueError(
                f"Product column {column_name} not found."
            )

        product_to_department[column_name] = product[
            "department"
        ]

    department_columns = {}

    for column_name, department in product_to_department.items():
        if department not in department_columns:
            department_columns[department] = []

        department_columns[department].append(column_name)

    step_seven_data = get_step_seven_summary()

    opportunities_by_customer = (
        step_seven_data["opportunities_by_customer"]
    )

    total_opportunities = 0
    matched_opportunities = 0
    customers_with_opportunities = 0
    customers_with_department_hits = 0

    for customer_data in opportunities_by_customer:
        customer_index = customer_data["customer_id"] - 1

        actual_next_order = Y[customer_index] > 0

        opportunities = customer_data["opportunities"]

        if not opportunities:
            continue

        customers_with_opportunities += 1

        customer_has_hit = False

        for opportunity in opportunities:
            department = opportunity["department"]

            columns = department_columns.get(
                department, []
            )

            column_indices = [
                X_df.columns.get_loc(column)
                for column in columns
            ]

            department_purchased = bool(
                np.any(actual_next_order[column_indices])
            )

            total_opportunities += 1

            if department_purchased:
                matched_opportunities += 1
                customer_has_hit = True

        if customer_has_hit:
            customers_with_department_hits += 1

    department_opportunity_hit_rate = (
        matched_opportunities / total_opportunities
        if total_opportunities > 0
        else 0
    )

    department_customer_hit_rate = (
        customers_with_department_hits /
        customers_with_opportunities
        if customers_with_opportunities > 0
        else 0
    )

    return {
        "customer_count": int(customer_count),
        "product_count": int(product_count),
        "customers_evaluated": int(customer_count),
        "recommendation_count": int(recommendation_count),
        "component_counts": component_counts,
        "svd_results": svd_results,
        "popularity_baseline": baseline_result,
        "department_evaluation": {
            "customers_with_opportunities": int(
                customers_with_opportunities
            ),
            "customers_with_department_hits": int(
                customers_with_department_hits
            ),
            "total_opportunities": int(
                total_opportunities
            ),
            "matched_opportunities": int(
                matched_opportunities
            ),
            "opportunity_hit_rate": round(
                float(
                    department_opportunity_hit_rate * 100
                ), 2
            ),
            "customer_hit_rate": round(
                float(
                    department_customer_hit_rate * 100
                ), 2
            )
        }
    }
