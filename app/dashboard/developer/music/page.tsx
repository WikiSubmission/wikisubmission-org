'use client';

import { Database } from "@/types/supabase-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, ArrowUpRightFromCircleIcon, CalendarIcon, CheckIcon, CopyIcon, Edit2Icon, MusicIcon, PlusIcon, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { FaDatabase } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getArtists, getCategories, getTracks, saveTrack, deleteTrack, uploadTrackFile, createArtist, createCategory } from "./queries";
import Link from "next/link";

export default function MusicPage() {

    const { data: tracks = [], isLoading: isTracksLoading } = useQuery({
        queryKey: ['music-tracks'],
        queryFn: getTracks
    });

    const { data: artists = [] } = useQuery({
        queryKey: ['music-artists'],
        queryFn: getArtists
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['music-categories'],
        queryFn: getCategories
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

            <section className="flex flex-col gap-3 items-left">
                <Link
                    href={`https://supabase.com/dashboard/project/lbubcoodmaimkadoessn/editor/74913?schema=public&sort=release_date%3Adesc`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaDatabase className="size-3" />
                        ws_music_tracks (DB / Supabase) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>

                <Link
                    href={`https://supabase.com/dashboard/project/lbubcoodmaimkadoessn/editor/74876?schema=public`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaDatabase className="size-3" />
                        ws_music_artists (DB / Supabase) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>

                <Link
                    href={`https://supabase.com/dashboard/project/lbubcoodmaimkadoessn/editor/74888?schema=public`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaDatabase className="size-3" />
                        ws_music_categories (DB / Supabase) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>
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
                                    <p className="font-semibold flex items-center gap-2">
                                        <MusicIcon className="size-4" />
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
    const [featured, setFeatured] = useState(false);
    const [releaseDate, setReleaseDate] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [isAddingArtist, setIsAddingArtist] = useState(false);
    const [newArtistName, setNewArtistName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            Promise.resolve().then(() => {
                setStep(1);
                setName(track?.name || '');
                setArtistId(track?.artist || '');
                setCategoryId(track?.category || '');
                setUrl(track?.url || '');
                setFeatured(track?.featured || false);
                setReleaseDate(track?.release_date || new Date().toISOString().split('T')[0]);
            });
        }
    }, [track, isOpen]);

    const saveMutation = useMutation({
        mutationFn: async (trackData: Database["public"]["Tables"]["ws_music_tracks"]["Insert"] | Database["public"]["Tables"]["ws_music_tracks"]["Update"]) => {
            return await saveTrack(trackData, track?.id);
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

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!selectedFile || !name || !artistId) {
                throw new Error("Missing name, artist, or file");
            }
            const artistName = artists.find(a => a.id === artistId)?.name || "Unknown";
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("artistName", artistName);
            formData.append("trackTitle", name);
            return await uploadTrackFile(formData);
        },
        onSuccess: (cdnUrl) => {
            setUrl(cdnUrl);
            toast.success("File uploaded and track saved!");
            setSelectedFile(null);
            handleSave(cdnUrl);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!track?.id) return;
            return await deleteTrack(track.id);
        },
        onSuccess: () => {
            toast.success("Track deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['music-tracks'] });
            setIsOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const artistMutation = useMutation({
        mutationFn: createArtist,
        onSuccess: (newArtist) => {
            toast.success("Artist created successfully");
            queryClient.invalidateQueries({ queryKey: ['music-artists'] });
            setArtistId(newArtist.id);
            setIsAddingArtist(false);
            setNewArtistName('');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const categoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: (newCategory) => {
            toast.success("Category created successfully");
            queryClient.invalidateQueries({ queryKey: ['music-categories'] });
            setCategoryId(newCategory.id);
            setIsAddingCategory(false);
            setNewCategoryName('');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const handleNext = async () => {
        let currentArtistId = artistId;
        let currentCategoryId = categoryId;

        try {
            if (isAddingArtist && newArtistName) {
                const added = await artistMutation.mutateAsync(newArtistName);
                currentArtistId = added.id;
            }
            if (isAddingCategory && newCategoryName) {
                const added = await categoryMutation.mutateAsync(newCategoryName);
                currentCategoryId = added.id;
            }

            if (currentArtistId && currentCategoryId && name) {
                setStep(2);
            } else {
                toast.error("Please ensure all fields are filled");
            }
        } catch {
            // Errors are handled by mutation onError toasts
        }
    };

    const handleSave = (overrideUrl?: string) => {
        const finalUrl = overrideUrl || url;
        if (!name || !artistId || !categoryId || !finalUrl) {
            toast.error("Please fill in all required fields");
            return;
        }

        saveMutation.mutate({
            name,
            artist: artistId,
            category: categoryId,
            url: finalUrl,
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
                    <DialogTitle>{isEditing ? 'Edit' : 'New'} Track • Step {step} of 2</DialogTitle>
                </DialogHeader>

                {step === 1 ? (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Track Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter track name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="artist" className="flex justify-between items-center">
                                Artist
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px]"
                                    onClick={() => setIsAddingArtist(!isAddingArtist)}
                                >
                                    {isAddingArtist ? "Cancel" : "Add New"}
                                </Button>
                            </Label>
                            {isAddingArtist ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Artist Name"
                                        value={newArtistName}
                                        onChange={(e) => setNewArtistName(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => artistMutation.mutate(newArtistName)}
                                        disabled={!newArtistName || artistMutation.isPending}
                                    >
                                        {artistMutation.isPending ? <Spinner className="size-3" /> : <PlusIcon className="size-3" />}
                                    </Button>
                                </div>
                            ) : (
                                <select
                                    id="artist"
                                    value={artistId}
                                    onChange={(e) => setArtistId(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Select Artist</option>
                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="flex justify-between items-center">
                                Category
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px]"
                                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                                >
                                    {isAddingCategory ? "Cancel" : "Add New"}
                                </Button>
                            </Label>
                            {isAddingCategory ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => categoryMutation.mutate(newCategoryName)}
                                        disabled={!newCategoryName || categoryMutation.isPending}
                                    >
                                        {categoryMutation.isPending ? <Spinner className="size-3" /> : <PlusIcon className="size-3" />}
                                    </Button>
                                </div>
                            ) : (
                                <select
                                    id="category"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="release_date">Release Date</Label>
                            <Input id="release_date" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <Checkbox id="featured" checked={featured} onCheckedChange={(checked) => setFeatured(!!checked)} />
                            <Label htmlFor="featured" className="text-sm font-medium leading-none cursor-pointer">
                                Featured Track?
                            </Label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 overflow-hidden">
                        {url ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-200 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                    <CheckIcon className="size-5" />
                                    Track URL
                                </div>
                                <div className="flex items-center gap-2 bg-background p-2 rounded-lg border text-xs min-w-0">
                                    <code className="flex-1 truncate text-muted-foreground">{url}</code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => {
                                            navigator.clipboard.writeText(url);
                                            toast.success("URL copied to clipboard");
                                        }}
                                    >
                                        <CopyIcon className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 font-medium">
                                <Upload className="size-5 animate-bounce" />
                                File upload required to proceed
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">
                                {url ? "Replace File (Optional)" : "Upload Track File"}
                            </Label>
                            <div className="flex gap-2 min-w-0">
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="flex-1 min-w-0 text-muted-foreground"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => uploadMutation.mutate()}
                                    disabled={!selectedFile || uploadMutation.isPending || !name || !artistId}
                                >
                                    {uploadMutation.isPending ? (
                                        <Spinner className="size-4 animate-spin" />
                                    ) : (
                                        <Upload className="size-4 mr-1" />
                                    )}
                                    Upload
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed break-words">
                                Uploads will be stored at our S3 bucket (<code className="bg-muted px-1 rounded break-all">wikisubmission</code>) at path: <code className="bg-muted px-1 rounded break-all">media/zikr/&#123;Artist&#125;/&#123;Title&#125;</code>
                            </p>
                        </div>
                    </div>
                )}
                <DialogFooter className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        {step === 1 ? (
                            isEditing && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this track?")) {
                                            deleteMutation.mutate();
                                        }
                                    }}
                                    disabled={deleteMutation.isPending || saveMutation.isPending}
                                >
                                    <Trash2 className="size-4 mr-1" />
                                    Delete
                                </Button>
                            )
                        ) : (
                            <Button variant="secondary" onClick={() => setStep(1)} disabled={saveMutation.isPending}>
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {step === 1 ? (
                            <Button
                                size="sm"
                                onClick={handleNext}
                                disabled={
                                    !name ||
                                    (isAddingArtist ? !newArtistName : !artistId) ||
                                    (isAddingCategory ? !newCategoryName : !categoryId) ||
                                    artistMutation.isPending ||
                                    categoryMutation.isPending
                                }
                            >
                                {artistMutation.isPending || categoryMutation.isPending ? (
                                    <Spinner className="size-4 animate-spin mr-2" />
                                ) : (
                                    <ArrowRight className="size-4 ml-1 order-last" />
                                )}
                                Next
                            </Button>
                        ) : (
                            <>
                                <DialogClose asChild>
                                    <Button variant="outline" disabled={saveMutation.isPending || deleteMutation.isPending}>Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={() => handleSave()}
                                    disabled={saveMutation.isPending || deleteMutation.isPending || (step === 2 && !url)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white leading-none"
                                >
                                    {saveMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Track")}
                                </Button>
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}