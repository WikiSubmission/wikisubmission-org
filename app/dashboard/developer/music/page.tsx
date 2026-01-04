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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function MusicPage() {

    // Music data (joined query)

    const { data: tracks = [], isLoading: isTracksLoading } = useQuery({
        queryKey: ['music-tracks'],
        queryFn: async () => {
            const { data, error } = await supabase()
                .from("ws_music_tracks")
                .select("*, ws_music_artists(*), ws_music_categories(*)")
                .order("release_date", { ascending: false });
            if (error) throw error;
            return data as (Database["public"]["Tables"]["ws_music_tracks"]["Row"] & {
                ws_music_artists: Database["public"]["Tables"]["ws_music_artists"]["Row"] | null;
                ws_music_categories: Database["public"]["Tables"]["ws_music_categories"]["Row"] | null;
            })[];
        }
    });

    // Fetch artists/categories tables separately for edit dialog

    const { data: artists = [] } = useQuery({
        queryKey: ['music-artists'],
        queryFn: async () => {
            const { data, error } = await supabase().from("ws_music_artists").select("*").order("name");
            if (error) throw error;
            return data;
        }
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['music-categories'],
        queryFn: async () => {
            const { data, error } = await supabase().from("ws_music_categories").select("*").order("name");
            if (error) throw error;
            return data;
        }
    });

    if (isTracksLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Spinner className="size-4 animate-spin text-violet-600" />
            </div>
        );
    }

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
                            total tracks
                        </p>
                    </section>

                    <section className="p-4 bg-muted/50 rounded-2xl">
                        <p className="text-4xl font-semibold">
                            {tracks.filter(i => i.release_date && new Date(i.release_date).getTime() > new Date().getTime() - 60 * 60 * 24 * 7 * 1000).length}
                        </p>
                        <p className="text-muted-foreground">
                            release(s) this week
                        </p>
                    </section>
                </div>
            </section>

            <section className="space-y-2">
                <TrackDialog
                    artists={artists}
                    categories={categories}
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
    categories
}: {
    track?: Database["public"]["Tables"]["ws_music_tracks"]["Row"],
    artists: Database["public"]["Tables"]["ws_music_artists"]["Row"][],
    categories: Database["public"]["Tables"]["ws_music_categories"]["Row"][]
}) {
    const isEditing = !!track;
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [artistId, setArtistId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [url, setUrl] = useState('');
    const [album, setAlbum] = useState('');
    const [featured, setFeatured] = useState(false);
    const [releaseDate, setReleaseDate] = useState('');
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

    const saveMutation = useMutation({
        mutationFn: async (trackData: Database["public"]["Tables"]["ws_music_tracks"]["Insert"] | Database["public"]["Tables"]["ws_music_tracks"]["Update"]) => {
            const res = isEditing
                ? await supabase().from("ws_music_tracks").update(trackData as Database["public"]["Tables"]["ws_music_tracks"]["Update"]).eq("id", track.id).select()
                : await supabase().from("ws_music_tracks").insert(trackData as Database["public"]["Tables"]["ws_music_tracks"]["Insert"]).select();

            if (res.error) throw res.error;
            if (!res.data || res.data.length === 0) throw new Error("No rows were affected.");
            return res.data;
        },
        onSuccess: () => {
            toast.success(`Track ${isEditing ? 'updated' : 'added'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['music-tracks'] });
            setIsOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const handleSave = () => {
        if (!name || !artistId || !categoryId || !url) {
            toast.error("Please fill in all required fields");
            return;
        }

        saveMutation.mutate({
            name,
            artist: artistId,
            category: categoryId,
            url,
            album: album || null,
            featured,
            release_date: releaseDate
        });
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
                        <PlusIcon className="size-5" />
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
                        <Button variant="secondary" disabled={saveMutation.isPending}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-violet-600 hover:bg-violet-700 text-white">
                        {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}