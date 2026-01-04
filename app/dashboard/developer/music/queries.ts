'use server';

import { Database } from "@/types/supabase-types";
import { supabase } from "@/lib/supabase";

export const getTracks = async () => {
    const { data, error } = await supabase()
        .from("ws_music_tracks")
        .select("*, ws_music_artists(*), ws_music_categories(*)")
        .order("release_date", { ascending: false });
    if (error) throw error;
    return data;
}

export const getArtists = async () => {
    const { data, error } = await supabase()
        .from("ws_music_artists")
        .select("*")
        .order("name");
    if (error) throw error;
    return data;
}

export const getCategories = async () => {
    const { data, error } = await supabase()
        .from("ws_music_categories")
        .select("*")
        .order("name");
    if (error) throw error;
    return data;
}

export const saveTrack = async (
    trackData: Database["public"]["Tables"]["ws_music_tracks"]["Insert"] | Database["public"]["Tables"]["ws_music_tracks"]["Update"],
    id?: string
) => {
    const res = id
        ? await supabase().from("ws_music_tracks").update(trackData).eq("id", id).select()
        : await supabase().from("ws_music_tracks").insert(trackData as Database["public"]["Tables"]["ws_music_tracks"]["Insert"]).select();

    if (res.error) throw res.error;
    if (!res.data || res.data.length === 0) throw new Error("No rows were affected.");
    return res.data;
}

import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, CLOUDFRONT_URL } from "@/lib/s3";

export const deleteTrack = async (id: string) => {
    const res = await supabase().from("ws_music_tracks").delete().eq("id", id).select();

    if (res.error) throw res.error;
    if (!res.data || res.data.length === 0) throw new Error("No rows were affected.");

    const deletedTrack = res.data[0];

    // Try to delete it from S3 (low priority task)
    if (deletedTrack.url?.startsWith(CLOUDFRONT_URL)) {
        try {
            const key = deletedTrack.url.replace(`${CLOUDFRONT_URL}/`, "");
            await s3Client.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key
            }));
        } catch (s3Error) {
            console.error("Failed to delete S3 object:", s3Error);
        }
    }

    return res.data;
}

export const uploadTrackFile = async (formData: FormData) => {
    const file = formData.get("file") as File;
    const artistName = formData.get("artistName") as string;
    const trackTitle = formData.get("trackTitle") as string;

    if (!file || !artistName || !trackTitle) {
        throw new Error("Missing file, artist name, or track title");
    }

    const extension = file.name.split(".").pop();
    const filePath = `media/zikr/${artistName}/${trackTitle}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET_NAME,
            Key: filePath,
            Body: buffer,
            ContentType: file.type,
        },
    });

    await upload.done();

    return `${CLOUDFRONT_URL}/${filePath}`;
}
