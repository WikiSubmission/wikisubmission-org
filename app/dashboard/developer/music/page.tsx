'use client';

import { Database } from "@/types/supabase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, CopyIcon, Edit2Icon, MusicIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function MusicPage() {

    const [tracks, setTracks] = useState<(Database["public"]["Tables"]["ws_music_tracks"]["Row"] & {
        ws_music_artists: Database["public"]["Tables"]["ws_music_artists"]["Row"] | null;
        ws_music_categories: Database["public"]["Tables"]["ws_music_categories"]["Row"] | null;
    })[]>([]);

    const [artists, setArtists] = useState<Database["public"]["Tables"]["ws_music_artists"]["Row"][]>([]);
    const [categories, setCategories] = useState<Database["public"]["Tables"]["ws_music_categories"]["Row"][]>([]);

    const fetchTracks = async () => {
        const { data, error } = await supabase()
            .from("ws_music_tracks")
            .select("*, ws_music_artists(*), ws_music_categories(*)")
            .order("release_date", { ascending: false });
        if (error) {
            toast.error(`${error.name}: ${error.message}`);
        } else {
            setTracks(data);
        }
    };

    const fetchMetadata = async () => {
        const [artistsRes, categoriesRes] = await Promise.all([
            supabase().from("ws_music_artists").select("*").order("name"),
            supabase().from("ws_music_categories").select("*").order("name")
        ]);

        if (artistsRes.data) setArtists(artistsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchTracks();
            fetchMetadata();
        });
    }, []);

    return (
        <main className="space-y-4 max-w-full overflow-hidden">
            <section>
                <h1 className="text-2xl font-bold">Music</h1>
            </section>

            <section className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <section className="p-4 bg-muted/50 rounded-2xl">
                        <p className="text-4xl font-semibold">
                            {tracks.length}
                        </p>
                        <p className="text-muted-foreground">
                            music tracks
                        </p>
                    </section>

                    <section className="p-4 bg-muted/50 rounded-2xl">
                        <p className="text-4xl font-semibold">
                            {tracks.filter(i => i.release_date && new Date(i.release_date).getTime() > new Date().getTime() - 60 * 60 * 24 * 7 * 1000).length}
                        </p>
                        <p className="text-muted-foreground">
                            releases this week
                        </p>
                    </section>
                </div>
            </section>

            <section className="space-y-2">
                <TrackDialog
                    artists={artists}
                    categories={categories}
                    onSuccess={fetchTracks}
                />

                <div className="space-y-2">
                    {tracks.map((track) => (
                        <section key={track.id} className="p-4 bg-muted/50 rounded-2xl flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {track.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {track.ws_music_artists?.name}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <p className="text-[10px] text-center text-muted-foreground py-1 px-2 rounded-full bg-muted/50 w-fit flex items-center gap-1">
                                        <CalendarIcon className="size-3" />
                                        {track.release_date ? new Date(track.release_date).toLocaleDateString() : "Unknown"}
                                    </p>
                                    <p className="text-[10px] text-center text-muted-foreground py-1 px-2 rounded-full bg-muted/50 w-fit flex items-center gap-1">
                                        <MusicIcon className="size-3" />
                                        {track.ws_music_categories?.name}
                                    </p>
                                    <p className="text-[10px] text-center text-muted-foreground hover:text-violet-500 cursor-pointer py-1 px-2 rounded-full bg-muted/50 w-fit flex items-center gap-1" onClick={() => {
                                        navigator.clipboard.writeText(track.url)
                                        toast.success("Link copied to clipboard");
                                    }}>
                                        Download Link <CopyIcon className="size-2.5" />
                                    </p>
                                    <p className="text-[10px] text-center text-muted-foreground hover:text-violet-500 cursor-pointer py-1 px-2 rounded-full bg-muted/50 w-fit flex items-center gap-1" onClick={() => {
                                        navigator.clipboard.writeText(`https://wikisubmission.org/music?track=${track.id}`)
                                        toast.success("Link copied to clipboard");
                                    }}>
                                        Player Link <CopyIcon className="size-2.5" />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrackDialog
                                    track={track}
                                    artists={artists}
                                    categories={categories}
                                    onSuccess={fetchTracks}
                                />
                            </div>
                        </section>
                    ))}
                </div>
            </section>
        </main>
    )
}

function TrackDialog({
    track,
    artists,
    categories,
    onSuccess
}: {
    track?: Database["public"]["Tables"]["ws_music_tracks"]["Row"],
    artists: Database["public"]["Tables"]["ws_music_artists"]["Row"][],
    categories: Database["public"]["Tables"]["ws_music_categories"]["Row"][],
    onSuccess: () => void
}) {
    const isEditing = !!track;
    const [name, setName] = useState(track?.name || '');
    const [artistId, setArtistId] = useState(track?.artist || '');
    const [categoryId, setCategoryId] = useState(track?.category || '');
    const [url, setUrl] = useState(track?.url || '');
    const [album, setAlbum] = useState(track?.album || '');
    const [featured, setFeatured] = useState(track?.featured || false);
    const [releaseDate, setReleaseDate] = useState(track?.release_date || new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            Promise.resolve().then(() => {
                setName(track?.name || '');
                setArtistId(track?.artist || '');
                setCategoryId(track?.category || '');
                setUrl(track?.url || '');
                setAlbum(track?.album || '');
                setFeatured(track?.featured || false);
                setReleaseDate(track?.release_date || new Date().toISOString().split('T')[0]);
            });
        }
    }, [track, isOpen]);
    const handleSave = async () => {
        if (!name || !artistId || !categoryId || !url) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        const trackData = {
            name,
            artist: artistId,
            category: categoryId,
            url,
            album: album || null,
            featured,
            release_date: releaseDate
        };

        console.log("Saving track data:", trackData);
        if (isEditing) console.log("Updating track ID:", track.id);

        const res = isEditing
            ? await supabase().from("ws_music_tracks").update(trackData).eq("id", track.id).select()
            : await supabase().from("ws_music_tracks").insert(trackData).select();

        console.log("Supabase response:", res);

        setIsSaving(false);
        if (res.error) {
            toast.error(res.error.message);
        } else if (res.data && res.data.length > 0) {
            toast.success(`Track ${isEditing ? 'updated' : 'added'} successfully`);
            setIsOpen(false);
            onSuccess();
        } else {
            toast.warning("Request completed but no rows were affected. Check permissions.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon">
                        <Edit2Icon className="size-3" />
                    </Button>
                ) : (
                    <Button variant="outline" >
                        <PlusIcon className="size-5" size="icon" />
                        New Track
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit' : 'New'} Track</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Track Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter track name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="artist">Artist</Label>
                        <select
                            id="artist"
                            value={artistId}
                            onChange={(e) => setArtistId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Select Artist</option>
                            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="url">Stream URL</Label>
                        <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="album">Album (Optional)</Label>
                        <Input id="album" value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Album name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="release_date">Release Date</Label>
                        <Input id="release_date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="featured" checked={featured} onCheckedChange={(checked) => setFeatured(!!checked)} />
                        <Label htmlFor="featured" className="text-sm font-medium leading-none cursor-pointer">
                            Featured Track
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary" disabled={isSaving}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}