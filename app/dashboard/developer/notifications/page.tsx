'use client';

import { FaApple, FaCloud, FaDatabase, FaGithub } from "react-icons/fa";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, ArrowUpRightFromCircleIcon, BellIcon, BellMinusIcon, CheckIcon, CopyIcon, MapPinIcon, XIcon } from "lucide-react";
import { Database } from "@/types/supabase-internal-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Fonts } from "@/constants/fonts";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { getNotifications, sendNotification } from "./queries";
import { formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import useLocalStorage from "@/hooks/use-local-storage";

export default function NotificationsPage() {
    const [sortBy, setSortBy] = useState<'last_delivery' | 'new'>('last_delivery');
    const [filterInactive, setFilterInactive] = useState(false);

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications
    });

    // Subjective filter for "inactive" devices
    const isInactive = (notification: Database["internal"]["Tables"]["ws_notifications_ios"]["Row"]) => {
        const prayerTimesOff = !notification.prayer_times_notifications ||
            (typeof notification.prayer_times_notifications === 'object' &&
                'enabled' in notification.prayer_times_notifications &&
                !notification.prayer_times_notifications.enabled);
        const dailyVerseOff = !notification.daily_verse_notifications;
        const dailyChapterOff = !notification.daily_chapter_notifications;
        return prayerTimesOff && dailyVerseOff && dailyChapterOff;
    };

    const displayNotifications = notifications
        .filter(notification => filterInactive ? isInactive(notification) : true)
        .sort((a, b) => {
            if (sortBy === 'last_delivery') {
                const aTime = a.last_delivery_at ? new Date(a.last_delivery_at).getTime() : 0;
                const bTime = b.last_delivery_at ? new Date(b.last_delivery_at).getTime() : 0;
                if (aTime !== bTime) return bTime - aTime;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Spinner className="size-4 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <main className="space-y-4 max-w-full overflow-hidden">
            <section>
                <h1 className="text-2xl font-bold">Notifications</h1>
            </section>

            <section>
                <p className="text-lg font-light tracking-wider flex items-center justify-between gap-2">
                    iOS
                    <FaApple className="size-6" />
                </p>
                <hr />
            </section>

            <section className="flex flex-wrap gap-2">
                <section className="p-4 bg-muted/50 rounded-2xl">
                    <p className="text-4xl font-semibold">
                        {notifications.length}
                    </p>
                    <p className="text-muted-foreground">
                        registered devices
                    </p>
                </section>

                <section className="p-4 bg-muted/50 rounded-2xl">
                    <p className="text-4xl font-semibold">
                        {notifications.filter(i => i.last_delivery_at && new Date(i.last_delivery_at).getTime() > new Date().getTime() - 60 * 60 * 1000).length}+
                    </p>
                    <p className="text-muted-foreground">
                        deliveries in last hour
                    </p>
                </section>
            </section>

            <section className="flex flex-col gap-3 items-left">
                <Link
                    href={`https://supabase.com/dashboard/project/lbubcoodmaimkadoessn/editor/59408?schema=internal&sort=updated_at%3Adesc`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaDatabase className="size-3" />
                        ws_notifications_ios (DB / Supabase) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>

                <Link
                    href={`https://github.com/WikiSubmission/wikisubmission-push-notifications`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaGithub className="size-3" />
                        ws-push-notifications (Server / GitHub) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>

                <Link
                    href={`https://railway.com/project/c7a4935a-63c3-4746-8625-18a08494758a/service/e4209bfc-c0c8-495b-bea7-72a9c86c0225`}
                    target="_blank"
                    className="flex w-fit"
                >
                    <p className="text-xs font-semibold text-primary tracking-wider flex items-center gap-1 text-violet-500 hover:text-violet-600 cursor-pointer">
                        <FaCloud className="size-3" />
                        ws-push-notifications (Deployment / Railway) <ArrowUpRightFromCircleIcon className="size-3" />
                    </p>
                </Link>
            </section>

            <section className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Sort</span>
                <div className="flex bg-muted/30 p-1 rounded-full gap-1">
                    <button
                        onClick={() => setSortBy('last_delivery')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sortBy === 'last_delivery' ? 'bg-background shadow-sm text-foreground' : 'hover:bg-muted/50 text-muted-foreground'}`}
                    >
                        Recent deliveries
                    </button>
                    <button
                        onClick={() => setSortBy('new')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sortBy === 'new' ? 'bg-background shadow-sm text-foreground' : 'hover:bg-muted/50 text-muted-foreground'}`}
                    >
                        New Devices
                    </button>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2 mr-1">Filter</span>
                <button
                    onClick={() => setFilterInactive(!filterInactive)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${filterInactive ? 'bg-red-500/10 text-red-600 border border-red-200' : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-transparent'}`}
                >
                    Inactive
                    {filterInactive && <CheckIcon className="size-3" />}
                </button>
            </section>

            <section className="space-y-2">
                {displayNotifications.map((notification) => (
                    <div key={notification.device_token} className="p-4 bg-muted/50 rounded-2xl w-full min-w-0 text-xs space-y-2">

                        <section className="flex items-start w-full justify-between">
                            <div className="flex gap-2 items-center bg-muted/50 p-2 rounded-full">
                                <FaApple className="size-4" />
                                <p className={`font-semibold ${Fonts.geistMono.className}`}>
                                    {notification.device_token.slice(0, 5) + "..." + notification.device_token.slice(-5)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <p className="text-muted-foreground" title={new Date(notification.created_at).toLocaleString()}>
                                    Added {formatTimeAgo(notification.created_at)}
                                </p>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(notification.device_token);
                                    toast.info("Device token copied to clipboard");
                                }}>
                                    <CopyIcon className="size-3 hover:text-violet-600 cursor-pointer" />
                                </button>
                            </div>
                        </section>

                        <section className="space-y-1">
                            {notification.last_delivery_at ? (
                                <p className="text-muted-foreground flex items-center gap-1" title={new Date(notification.last_delivery_at).toLocaleString()}>
                                    <BellIcon className="size-3 text-violet-600" />
                                    Last delivery: {formatTimeAgo(notification.last_delivery_at)}
                                </p>
                            ) : (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <BellMinusIcon className="size-3 text-red-500" />
                                    No notifications sent
                                </p>
                            )}
                            {notification.prayer_times_notifications && typeof notification.prayer_times_notifications === 'object' && 'enabled' in notification.prayer_times_notifications && notification.prayer_times_notifications.enabled ? (
                                <div className="flex gap-2">
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <CheckIcon className="size-3 text-violet-600" />
                                        Prayer times on
                                    </p>
                                    {'location' in notification.prayer_times_notifications && typeof notification.prayer_times_notifications.location === 'string' ? (
                                        <div>
                                            <p className="text-muted-foreground flex items-center gap-1 break-all">
                                                <MapPinIcon className="size-3 text-amber-500 shrink-0" />
                                                {notification.prayer_times_notifications.location.split(",").join(", ")}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <XIcon className="size-3 text-red-500" />
                                            Location not set
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <XIcon className="size-3 text-red-500" />
                                    Prayer times off
                                </p>
                            )}
                            {notification.daily_verse_notifications && typeof notification.daily_verse_notifications === 'boolean' && notification.daily_verse_notifications ? (
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <CheckIcon className="size-3 text-violet-600" />
                                        Daily verse on
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <XIcon className="size-3 text-red-500" />
                                    Daily verse off
                                </p>
                            )}

                            {notification.daily_chapter_notifications && typeof notification.daily_chapter_notifications === 'boolean' && notification.daily_chapter_notifications ? (
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <CheckIcon className="size-3 text-violet-600" />
                                        Daily chapter on
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <XIcon className="size-3 text-red-500" />
                                    Daily chapter off
                                </p>
                            )}

                            {notification.announcement_notifications && typeof notification.announcement_notifications === 'boolean' && notification.announcement_notifications ? (
                                <div className="space-y-1">
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <CheckIcon className="size-3 text-violet-600" />
                                        Announcements on
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <XIcon className="size-3 text-red-500" />
                                    Announcements off
                                </p>
                            )}
                        </section>

                        <div>
                            <SendNotificationDialog
                                deviceToken={notification.device_token}
                            />
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}

function SendNotificationDialog({
    deviceToken
}: {
    deviceToken: string
}) {
    const queryClient = useQueryClient();
    const [apiKey, setApiKey] = useLocalStorage('notification_api_key', '');
    const [type, setType] = useState<"custom" | "random_verse" | "prayer_times" | "daily_verse" | "daily_chapter">("random_verse");
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [force, setForce] = useState(false);
    const [apiResponse, setApiResponse] = useState<unknown>(null);

    const sendMutation = useMutation({
        mutationFn: sendNotification,
        onSuccess: (res) => {
            toast.success("Notification sent successfully");
            setApiResponse(res);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
            setApiResponse({ error: error.message });
        }
    });

    return (
        <Dialog onOpenChange={(open) => {
            if (!open) {
                setApiResponse(null);
                sendMutation.reset();
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="text-xs">
                    Send a notification
                    <ArrowRight className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md space-y-1">
                <DialogHeader>
                    <DialogTitle>Send notification</DialogTitle>
                    <DialogDescription>
                        <div className="flex gap-2 justify-between items-center bg-muted/50 p-2 rounded-full">
                            <div className="flex gap-2 items-center">
                                <FaApple className="size-4" />
                                <p className={`font-semibold ${Fonts.geistMono.className}`}>
                                    {deviceToken.slice(0, 5) + "..." + deviceToken.slice(-5)}
                                </p>
                            </div>
                            <CopyIcon className="size-4 cursor-pointer" onClick={() => {
                                navigator.clipboard.writeText(deviceToken);
                                toast.success("Device token copied to clipboard");
                            }} />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="api-key">API Key</Label>
                            <p className="text-xs text-muted-foreground">
                                This key is required to send notifications. It is defined in the push-notifications server&apos;s <a
                                    href="https://railway.com/project/c7a4935a-63c3-4746-8625-18a08494758a/service/e4209bfc-c0c8-495b-bea7-72a9c86c0225/variables?environmentId=0140eee1-e990-4596-a8aa-87ed8fdca859"
                                    className="underline"
                                    target="_blank"
                                >deployment instance</a> as the <span className={`${Fonts.geistMono.className} bg-muted/50 px-1 rounded`}>API_KEY</span> environment variable.
                            </p>
                        </div>
                        <Input
                            id="api-key"
                            placeholder="Enter notification API key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Notification Type</Label>
                        <select
                            id="type"
                            className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={type}
                            onChange={(e) => setType(e.target.value as "custom" | "random_verse" | "prayer_times" | "daily_verse" | "daily_chapter")}
                        >
                            <option value="random_verse">Random Verse</option>
                            <option value="prayer_times">Prayer Times</option>
                            <option value="daily_verse">Daily Verse</option>
                            <option value="daily_chapter">Daily Chapter</option>
                            <option value="custom">Custom Message</option>
                        </select>
                    </div>

                    {type === "custom" && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Message Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Body (Optional)</Label>
                                <Textarea
                                    id="body"
                                    placeholder="Message Body"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="force"
                                checked={force}
                                onCheckedChange={(checked) => setForce(checked === true)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="force">
                                    Force delivery
                                </Label>
                                <p className="text-muted-foreground text-[10px]">
                                    Ignore any delivery limits
                                </p>
                            </div>
                        </div>
                        {force && (
                            <p className="text-red-500 font-medium text-[10px] animate-in fade-in slide-in-from-top-1">
                                (avoid spamming!)
                            </p>
                        )}
                    </div>

                    {Boolean(apiResponse) && (
                        <div className="space-y-2 border-t pt-4 grid grid-cols-1 min-w-0">
                            <Label>API Response</Label>
                            <div className="bg-muted p-3 rounded-lg overflow-x-auto max-h-[200px] min-w-0 w-full border">
                                <pre className="text-[10px] font-mono whitespace-pre-wrap break-words">
                                    {JSON.stringify(apiResponse, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        disabled={sendMutation.isPending || !apiKey}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={() => {
                            sendMutation.mutate({
                                apiKey,
                                deviceToken,
                                type,
                                message: {
                                    ...title && { title },
                                    ...body && { body }
                                },
                                force
                            });
                        }}
                    >
                        {sendMutation.isPending ? "Sending..." : "Send Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}