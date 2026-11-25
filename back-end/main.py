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
