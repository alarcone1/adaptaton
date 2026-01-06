import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        // error is type `ErrorResponse`
        errorMessage = `${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
                <p className="text-lg text-gray-600">Sorry, an unexpected error has occurred.</p>
                <p className="text-red-500 font-mono bg-red-50 p-2 rounded">
                    {errorMessage}
                </p>
                <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Go back home
                </Link>
            </div>
        </div>
    );
};
