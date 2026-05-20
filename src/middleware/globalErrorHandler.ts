export const globalErrorHandler = (err: any,
    req: any,
    res: any,
    next: any) => {
    
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};
export default globalErrorHandler;