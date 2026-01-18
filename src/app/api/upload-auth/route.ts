import { getUploadAuthParams } from "@imagekit/next/server";
import { env } from "~/env";

export async function GET() {
  try {
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: env.IMAGEKIT_PUBLIC_KEY as string,
      // expire: 30 * 60, // Optional: 30 minutes expiry (default is 1 hour)
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: env.IMAGEKIT_PUBLIC_KEY as string,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT as string,
    });
  } catch (error) {
    console.error("Upload auth error:", error);
    return Response.json(
      { error: "Failed to generate upload credentials" },
      { status: 500 },
    );
  }
}