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

export const deleteTrack = async (id: string) => {
    const res = await supabase().from("ws_music_tracks").delete().eq("id", id).select();

    if (res.error) throw res.error;
    if (!res.data || res.data.length === 0) throw new Error("No rows were affected.");
    return res.data;
}
