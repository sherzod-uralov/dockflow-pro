"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getAllClientCookies, getClientCookie } from "@/lib/cookie-utils";

export const TokenDebug = () => {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [refreshTokenCookie, setRefreshTokenCookie] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Client-side cookie check
    if (typeof window !== "undefined") {
      const allCookies = getAllClientCookies();
      setCookies(allCookies);

      // Check specifically for refresh token cookie
      const refreshToken = getClientCookie("refresh-token");
      setRefreshTokenCookie(refreshToken);
    }
  }, [session]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50 max-h-96 overflow-y-auto">
      <h3 className="text-green-400 mb-2">🔧 Token Debug Info</h3>

      <div className="space-y-2">
        <div>
          <span className="text-yellow-300">Status:</span> {status}
        </div>

        <div>
          <span className="text-yellow-300">Session exists:</span>{" "}
          {session ? "✅" : "❌"}
        </div>

        {session && (
          <>
            <div>
              <span className="text-yellow-300">User ID:</span>{" "}
              {session.user?.id || "N/A"}
            </div>

            <div>
              <span className="text-yellow-300">Username:</span>{" "}
              {session.user?.username || "N/A"}
            </div>

            <div>
              <span className="text-yellow-300">Access Token (Session):</span>
              <div className="text-xs bg-gray-800 p-1 rounded mt-1">
                {session.accessToken
                  ? `${session.accessToken.substring(0, 30)}...`
                  : "❌ Missing"}
              </div>
            </div>

            <div>
              <span className="text-yellow-300">Refresh Token (Session):</span>
              <div className="text-xs bg-gray-800 p-1 rounded mt-1">
                {session.refreshToken
                  ? `${session.refreshToken.substring(0, 30)}...`
                  : "❌ Missing"}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-gray-600 pt-2 mt-3">
          <span className="text-yellow-300">Browser Cookies:</span>

          <div>
            <span className="text-blue-300">Refresh Token Cookie:</span>
            <div className="text-xs bg-gray-800 p-1 rounded mt-1">
              {refreshTokenCookie
                ? `${refreshTokenCookie.substring(0, 30)}...`
                : "❌ Not found"}
            </div>
          </div>

          <div className="mt-2">
            <span className="text-blue-300">NextAuth Session Cookie:</span>
            <div className="text-xs bg-gray-800 p-1 rounded mt-1">
              {cookies["next-auth.session-token"]
                ? `${cookies["next-auth.session-token"].substring(0, 30)}...`
                : "❌ Not found"}
            </div>
          </div>

          <div className="mt-2">
            <span className="text-blue-300">
              All Cookies ({Object.keys(cookies).length}):
            </span>
            <div className="text-xs bg-gray-800 p-2 rounded mt-1 max-h-20 overflow-y-auto">
              {Object.keys(cookies).length > 0 ? (
                <ul className="space-y-1">
                  {Object.entries(cookies).map(([name, value]) => (
                    <li key={name} className="text-xs">
                      <span className="text-cyan-300">{name}:</span>{" "}
                      {value.length > 20
                        ? `${value.substring(0, 20)}...`
                        : value}
                    </li>
                  ))}
                </ul>
              ) : (
                "No cookies found"
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              console.log("🔧 Full Session Debug:", { session, status });
              console.log("🔧 All Browser Cookies:", cookies);
              console.log("🔧 Refresh Token Cookie:", refreshTokenCookie);
              console.log("🔧 Raw Document Cookie:", document.cookie);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Log All
          </button>

          <button
            onClick={() => {
              // Refresh cookies
              const allCookies = getAllClientCookies();
              setCookies(allCookies);
              const refreshToken = getClientCookie("refresh-token");
              setRefreshTokenCookie(refreshToken);
            }}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
          >
            Refresh
          </button>

          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/refresh-token");
                const data = await response.json();
                console.log("🔧 Server-side refresh token check:", data);
              } catch (error) {
                console.error(
                  "🔧 Failed to check server refresh token:",
                  error,
                );
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
          >
            Check Server
          </button>

          <button
            onClick={async () => {
              if (!session?.refreshToken) {
                console.log("🔧 No refresh token in session to test");
                return;
              }
              try {
                const response = await fetch("/api/auth/refresh-token", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ refreshToken: session.refreshToken }),
                });
                const data = await response.json();
                console.log("🔧 Manual cookie set result:", data);

                // Refresh the display
                setTimeout(() => {
                  const allCookies = getAllClientCookies();
                  setCookies(allCookies);
                  const refreshToken = getClientCookie("refresh-token");
                  setRefreshTokenCookie(refreshToken);
                }, 100);
              } catch (error) {
                console.error("🔧 Failed to set refresh token cookie:", error);
              }
            }}
            className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs"
          >
            Set Cookie
          </button>

          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/callback-handler");
                const data = await response.json();
                console.log("🔧 Custom callback check:", data);

                // Update display after checking
                setTimeout(() => {
                  const allCookies = getAllClientCookies();
                  setCookies(allCookies);
                  const refreshToken = getClientCookie("refresh-token");
                  setRefreshTokenCookie(refreshToken);
                }, 100);
              } catch (error) {
                console.error("🔧 Failed to check custom callback:", error);
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Test Handler
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDebug;
