import { createMiddleware } from "@tanstack/react-start";

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
	const encoder = new TextEncoder();
	const aBuffer = encoder.encode(a);
	const bBuffer = encoder.encode(b);

	// Ensure both buffers have the same length for comparison
	if (aBuffer.length !== bBuffer.length) {
		return false;
	}

	return crypto.subtle.timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Parse Basic Auth credentials from Authorization header
 */
function parseBasicAuth(
	authHeader: string,
): { user: string; pass: string } | null {
	// Check if header starts with "Basic "
	if (!authHeader.startsWith("Basic ")) {
		return null;
	}

	try {
		// Extract and decode base64 credentials
		const base64Credentials = authHeader.slice(6);
		const credentials = atob(base64Credentials);

		// Parse "user:pass" format
		const colonIndex = credentials.indexOf(":");
		if (colonIndex === -1) {
			return null;
		}

		const user = credentials.slice(0, colonIndex);
		const pass = credentials.slice(colonIndex + 1);

		if (!user || !pass) {
			return null;
		}

		return { user, pass };
	} catch {
		// Base64 decode failed or other parsing error
		return null;
	}
}

/**
 * Basic Authentication Middleware for TanStack Start
 *
 * Validates HTTP Basic Auth credentials against environment variables.
 * Returns 401 Unauthorized if credentials are missing or invalid.
 */
export const basicAuthMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		// Get environment variables
		const validUser = process.env.BASIC_AUTH_USER;
		const validPass = process.env.BASIC_AUTH_PASSWORD;

		// Validate environment configuration
		if (!validUser || !validPass) {
			console.error("Basic Auth credentials not configured");
			return new Response("Server misconfiguration", {
				status: 500,
			});
		}

		// Extract Authorization header
		const authHeader = request.headers.get("Authorization");

		// No Authorization header - prompt for credentials
		if (!authHeader) {
			return new Response("Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="Secure Area"',
				},
			});
		}

		// Parse credentials from header
		const credentials = parseBasicAuth(authHeader);

		// Invalid header format or malformed credentials
		if (!credentials) {
			return new Response("Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="Secure Area"',
				},
			});
		}

		// Timing-safe credential comparison
		const userMatch = timingSafeEqual(credentials.user, validUser);
		const passMatch = timingSafeEqual(credentials.pass, validPass);

		// Invalid credentials
		if (!userMatch || !passMatch) {
			return new Response("Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="Secure Area"',
				},
			});
		}

		// Valid credentials - proceed to next middleware/handler
		return next();
	},
);
