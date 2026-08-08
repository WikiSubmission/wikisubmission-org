-- Appendix backfill: markdown bodies + video metadata → editorial_appendices
--
-- GENERATED FILE. Regenerate from apps/web with:
--   pnpm appendices:backfill
--
-- The 38 English appendices' prose lives in hardcoded TSX
-- (packages/shared/content/library/appendices/appendix-*.tsx) while their
-- editorial rows carry only a title and a snippet. This script moves the prose
-- into the rows so the public reader can stop falling back to the TSX. Each
-- appendix's single trailing YouTube embed is written as video_id /
-- video_title payload metadata rather than as body markdown.
--
-- The payload is jsonb, so nothing here changes the schema.
--
-- DRY RUN IS THE DEFAULT. Nothing is written unless -v apply=true is passed;
-- the transaction is rolled back and only the report is printed.
--
--   Dry run (default, writes nothing):
--     psql "$DATABASE_URL" -f apps/web/scripts/appendix-backfill.sql
--
--   Actually write the drafts:
--     psql "$DATABASE_URL" -v apply=true -f apps/web/scripts/appendix-backfill.sql
--
--   Also copy each touched draft into its published snapshot (see below):
--     psql "$DATABASE_URL" -v apply=true -v publish=true -f apps/web/scripts/appendix-backfill.sql
--
--   Pin one Quran version when a language carries more than one:
--     psql "$DATABASE_URL" -v version=authorized-translation -f ...
--
-- PUBLISHING IS DELIBERATELY SEPARATE. By default this writes the `draft`
-- payload only. The public endpoint serves the `published` snapshot, so until
-- something publishes, the live site is unchanged and the reader keeps
-- rendering the TSX. Review the drafts at /editor first, then either publish
-- them there or re-run this with -v publish=true.
--
-- It is safe to re-run. Rows are matched by code, updates are guarded with IS
-- DISTINCT FROM, so a second run touches nothing and does not bump updated_at.
-- Only rows whose owning Quran version is English are considered, and only the
-- codes listed below.

\set ON_ERROR_STOP on

-- Defaults for anything not passed with -v.
\if :{?apply}
\else
  \set apply false
\endif
\if :{?publish}
\else
  \set publish false
\endif
\if :{?version}
\else
  \set version ''
\endif

BEGIN;

CREATE TEMPORARY TABLE appendix_backfill (
  code        text PRIMARY KEY,
  body        text NOT NULL,
  video_id    text,
  video_title text
) ON COMMIT DROP;

INSERT INTO appendix_backfill (code, body, video_id, video_title) VALUES

-- Appendix 1: One of the Great Miracles
('1', $md$> [74:35] “One of the Great Miracles”
>
> (from: Quran The Final Testament, by Rashad Khalifa, PhD.)

The Quran is characterized by a unique phenomenon never found in any human authored book. Every element of the Quran is mathematically composed — the suras, the verses, the words, the number of certain letters, the number of words from the same root, the number and variety of divine names, the unique spelling of certain words, the absence or deliberate alteration of certain letters within certain words, and many other elements of the Quran besides its content. There are two major facets of the Quran’s mathematical system: (1) The mathematical literary composition, and (2) The mathematical structure involving the numbers of suras and verses. Because of this comprehensive mathematical coding, the slightest distortion of the Quran’s text or physical arrangement is immediately exposed.

> Simple to Understand · Impossible to Imitate

For the first time in history we have a scripture with built-in proof of divine authorship — a superhuman mathematical composition.

Any reader of this book can easily verify the Quran’s mathematical miracle. The word “God” (Allah) is written in bold capital letters throughout the text. The frequency of occurrence of the word “God” is noted at the bottom of each page. The last page of the text, Page 372, shows that the total occurrence of the word “God” is 2698, or 19×142.

Furthermore, when we add the numbers of all the verses where the word “God” occurs, we obtain a total of 118123, also a multiple of 19 (118123 = 19×6217). Nineteen is the common denominator throughout the Quran’s mathematical system.

This phenomenon alone suffices as incontrovertible proof that the Quran is God’s message to the world. No human being(s) could have kept track of 2698 occurrences of the word “God,” and the numbers of verses where they occur. This is especially impossible in view of (1) the age of ignorance during which the Quran was revealed, and (2) the fact that the suras and verses were widely separated in time and place of revelation. The chronological order of revelation was vastly different from the final format (Appendix 23). However, the Quran’s mathematical system is not limited to the word “God;” it is extremely vast, extremely intricate, and totally comprehensive.

## The Simple Facts

Like the Quran itself, the Quran’s mathematical coding ranges from the very simple, to the very complex. The Simple Facts are those observations that can be ascertained without using any tools. The complex facts require the assistance of a calculator or a computer. The following facts do not require any tools to be verified:

1. The first verse (1:1), known as "Basmalah," consists of 19 letters.
2. The Quran consists of 114 suras, which is 19 × 6.
3. The total number of verses in the Quran is 6346, or 19 × 334. [6234 numbered verses & 112 un-numbered verses (Basmalahs) 6234 + 112 = 6346] Note that 6 + 3 + 4 + 6 = 19.
4. The Basmalah occurs 114 times, despite its conspicuous absence from Sura 9 (it occurs twice in Sura 27) & 114 = 19 × 6.
5. From the missing Basmalah of Sura 9 to the extra Basmalah of Sura 27, there are precisely 19 suras.
6. It follows that the total of the sura numbers from 9 to 27 (9+10+11+12+...+26+27) is 342, or 19 × 18.
7. This total (342) also equals the number of words between the two Basmalahs of Sura 27, and 342 = 19 × 18.
8. The famous first revelation (96:1–5) consists of 19 words.
9. This 19-worded first revelation consists of 76 letters — 19 × 4.
10. Sura 96, first in the chronological sequence, consists of 19 verses.
11. This first chronological sura is placed atop the last 19 suras.
12. Sura 96 consists of 304 Arabic letters, and 304 equals 19 × 16.
13. The last revelation (Sura 110) consists of 19 words.
14. The first verse of the last revelation (110:1) consists of 19 letters.
15. 14 different Arabic letters form 14 different sets of "Quranic Initials" (such as A.L.M. of 2:1), and prefix 29 suras. These numbers add up to 14 + 14 + 29 = 57 = 19 × 3.
16. The total of the 29 sura numbers where the Quranic Initials occur is 2+3+7+...+50+68 = 822, and 822 + 14 (14 sets of initials) equals 836, or 19 × 44.
17. Between the first initialed sura (Sura 2) and the last initialed sura (Sura 68) there are 38 un-initialed suras — 19 × 2.
18. Between the first and last initialed sura there are 19 sets of alternating "initialed" and "un-initialed" suras.
19. The Quran mentions 30 different numbers: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 30, 40, 50, 60, 70, 80, 99, 100, 200, 300, 1000, 2000, 3000, 5000, 50,000, & 100,000. The sum of these numbers is 162,146 = 19 × 8,534.

This is a condensed summary of the Simple Facts.

## The Literary Mathematical Composition

The Quran is characterized by a unique phenomenon never found in any other book: 29 suras are prefixed with 14 different sets of “Quranic Initials,” consisting of one to five letters per set. Fourteen letters, half the Arabic alphabet, participate in these initials. The significance of the Quranic initials remained a divinely guarded secret for 14 centuries.

The Quran states in [10:20] and [25:4-6] that its miracle, i.e., proof of divine authorship, was destined to remain secret for a specific predetermined interim:

> They said, “Why hasn’t a miracle come down to him from his Lord?” Say, “Only God knows the future. Therefore, wait, and I will wait along with you.” [10:20]
>
> \*\*\*\*\*\*
>
> Those who disbelieved said, “This is no more than a fabrication by him, with the help of other people.” Indeed, they uttered a blasphemy; a falsehood. Others said, “Tales from the past that he wrote down; they were dictated to him day and night.” Say, “This was sent down from the One who knows ‘the secret’ in the heavens and the earth.” Surely, He is Forgiving, Most Merciful. [25:4-6]

The Quranic Initials constitute a major portion of the Quran’s 19-based mathematical miracle.

**Table 1: List of the Quranic Initials and Their Suras**

| No. | Sura | Title | Initials |
| --- | --- | --- | --- |
| 1 | 2 | The Heifer | A.L.M. |
| 2 | 3 | The Amramites | A.L.M. |
| 3 | 7 | The Purgatory | A.L.M.S. |
| 4 | 10 | Jonah | A.L.R. |
| 5 | 11 | Hûd | A.L.R. |
| 6 | 12 | Joseph | A.L.R. |
| 7 | 13 | Thunder | A.L.M.R. |
| 8 | 14 | Abraham | A.L.R. |
| 9 | 15 | Al-Hijr Valley | A.L.R. |
| 10 | 19 | Mary | K.H.Y.'A.S. |
| 11 | 20 | T.H. | T.H. |
| 12 | 26 | The Poets | T.S.M. |
| 13 | 27 | The Ant | T.S. |
| 14 | 28 | History | T.S.M. |
| 15 | 29 | The Spider | A.L.M. |
| 16 | 30 | The Romans | A.L.M. |
| 17 | 31 | Luqmaan | A.L.M. |
| 18 | 32 | Prostration | A.L.M. |
| 19 | 36 | Y.S. | Y.S. |
| 20 | 38 | S. | S. |
| 21 | 40 | Forgiver | H.M. |
| 22 | 41 | Elucidated | H.M. |
| 23 | 42 | Consultation | H.M. 'A.S.Q. |
| 24 | 43 | Ornaments | H.M. |
| 25 | 44 | Smoke | H.M. |
| 26 | 45 | Kneeling | H.M. |
| 27 | 46 | The Dunes | H.M. |
| 28 | 50 | Q. | Q. |
| 29 | 68 | The Pen | NuN |

## Historical Background

In 1968, I realized that the existing English translations of the Quran did not present the truthful message of God’s Final Testament. For example, the two most popular translators, Yusuf Ali and Marmaduke Pickthall, could not overcome their corrupted religious traditions when it came to the Quran’s great criterion in [39:45].

> When God ALONE is mentioned, the hearts of those who do not believe in the Hereafter shrink with aversion. But when others are mentioned beside Him, they rejoice. [39:45]

Yusuf Ali omitted the crucial word “ALONE” from his translation, and altered the rest of the verse by inserting the word “(gods).” Thus, he utterly destroyed this most important Quranic criterion. He translated [39:45] as follows:

> “When God, the One and Only, is mentioned, the hearts of those who believe not in the Hereafter are filled with disgust and horror; but when (gods) other than He are mentioned, behold, they are filled with joy.” [39:45] (according to A. Yusuf Ali)

The expression “When God, the One and Only, is mentioned,” is not the same as saying, “When God alone is mentioned.” One can mention “God, the One and Only,” and also mention Muhammad or Jesus, and no one will be upset. But if “God ALONE is mentioned,” you cannot mention anyone else, and a lot of people — those who idolize Muhammad or Jesus — will be upset. Thus, Yusuf Ali could not bring himself to present the truth of the Quran, if it exposed his corrupted belief.

Marmaduke Pickthall translated “ALONE” correctly, but destroyed the criterion by inserting his personal belief in parentheses; he translated [39:45] as follows:

> “And when Allah alone is mentioned, the hearts of those who believe not in the Hereafter are repelled, and when those (whom they worship) beside Him are mentioned, behold! they are glad.” [39:45] (according to Marmaduke Pickthall)

When I saw the truth of God’s word thus distorted, I decided to translate the Quran, at least for the benefit of my own children. Since I was a chemist by profession, and despite my extensive religious background — my father was a renowned Sufi leader in Egypt — I vowed to God that I would not move from one verse to the next unless I fully understood it.

I purchased all the available books of Quranic translations and exegeses (Tafseer) I could find, placed them on a large table, and began my translation. The first sura, The Key, was completed in a few days. The first verse in Sura 2 is “A.L.M.” The translation of this verse took four years, and coincided with the divine unveiling of “the secret,” the great mathematical Miracle of the Quran.

The books of Quranic exegeses unanimously agreed that “no one knows the meaning or significance of the Quranic Initials A.L.M., or any other initials.” I decided to write the Quran into the computer, analyze the whole text, and see if there were any mathematical correlations among these Quranic initials.

I used a time-share terminal, connected by telephone to a giant computer. To test my hypothesis, I decided to look at the single-lettered Quranic Initials — “Q” (Qaaf) of Suras 42 and 50, “S” (Saad) of Suras 7, 19, and 38, and “N” (Noon) of Sura 68. As detailed in my first book MIRACLE OF THE QURAN: SIGNIFICANCE OF THE MYSTERIOUS ALPHABETS (Islamic Productions, 1973), many previous attempts to unravel the mystery had failed.

## The Quranic Initial “Q” (Qaaf)

The computer data showed that the text of the only Q-initialed suras, 42 and 50, contained the same number of Q’s, 57 and 57. That was the first hint that a deliberate mathematical system may exist in the Quran.

Sura 50 is entitled “Q,” prefixed with “Q,” and the first verse reads, “Q, and the glorious Quran.” This indicated that “Q” stands for “Quran,” and the total number of Q’s in the two Q-initialed suras represents the Quran’s 114 suras (57+57 = 114 = 19×6). This idea was strengthened by the fact that “the Quran” occurs in the Quran 57 times.

The Quran is described in Sura “Q” as “Majid” (glorious), and the Arabic word “Majid” has a gematrical value of 57: M(40) + J(3) + I(10) + D(4) = 57.

Sura 42 consists of 53 verses, and 42+53 = 95 = 19×5.

Sura 50 consists of 45 verses, and 50+45 = 95, same total as in Sura 42.

By counting the letter “Q” in every “Verse 19” throughout the Quran, the total count comes to 76, 19×4. Here is a summary of the Q-related data:

> Summary of Q-Related Data
>
> 1. The frequency of occurrence of "Q" in Sura "Q" (No. 50) is 57, 19×3.
> 2. The letter "Q" occurs in the other Q-initialed sura (No. 42) exactly the same number of times, 57.
> 3. The total occurrence of the letter "Q" in the two Q-initialed suras is 114, which equals the number of suras in the Quran.
> 4. "The Quran" is mentioned in the Quran 57 times.
> 5. The description of the Quran as "Majid" (Glorious) is correlated with the frequency of occurrence of the letter "Q" in each of the Q-initialed suras. The word "Majid" has a gematrical value of 57.
> 6. Sura 42 consists of 53 verses, and 42+53 = 95 = 19×5.
> 7. Sura 50 consists of 45 verses, and 50+45 = 95 = 19×5.
> 8. The number of Q's in all verses numbered "19" throughout the Quran is 76, 19×4.

Glimpses of the Quran’s mathematical composition began to emerge. For example, it was observed that the people who disbelieved in Lot are mentioned in 50:13 and occur in the Quran 13 times — 7:80; 11:70, 74, 89; 21:74; 22:43; 26:160; 27:54, 56; 29:28; 38:13; 50:13; and 54:33. Consistently, they are referred to as “Qawm,” with the single exception of the Q-initialed Sura 50 where they are referred to as “Ikhwaan.” Obviously, if the regular, Q-containing word “Qawm” were used, the count of the letter “Q” in Sura 50 would have become 58, and this whole phenomenon would have disappeared. With the recognized absolute accuracy of mathematics, the alteration of a single letter destroys the system.

Another relevant example is the reference to Mecca in [3:96] as “Becca”! This strange spelling of the renowned city has puzzled Islamic scholars for many centuries. Although Mecca is mentioned in the Quran properly spelled in [48:24], the letter “M” is substituted with a “B” in [3:96]. It turns out that Sura 3 is an M-initialed sura, and the count of the letter “M” would have deviated from the Quran’s code if “Mecca” was spelled correctly in [3:96].

## NuN (Noon)

This initial is unique; it occurs in one sura, 68, and the name of the letter is spelled out as three letters — Noon Wow Noon — in the original text, and is therefore counted as two N’s. The total count of this letter in the N-initialed sura is 133, 19×7.

The fact that “N” is the last Quranic Initial (see Table 1) brings out a number of special observations. For example, the number of verses from the first Quranic Initial (A.L.M. of 2:1) to the last initial (N. of 68:1) is 5263, or 19×277.

The word “God” (Allah) occurs 2641 (19×139) times between the first initial and the last initial. Since the total occurrence of the word “God” is 2698, it follows that its occurrence outside the initials “A.L.M.” of 2:1 on one side, and the initial “N” of 68:1 on the other side, is 57, 19×3. Tables 9 to 18 prove that the initial “NuN” must be spelled out to show two N’s.

## S (Saad)

This initial prefixes three suras, 7, 19, and 38, and the total occurrence of the letter “S” (Saad) in these three suras is 152, 19×8 (Table 2). It is noteworthy that in [7:69], the word “Bastatan” is written in some printings with a “Saad,” instead of “Seen.”

**Table 2: Frequency of Occurrence of the Letter "S" in the Saad-initialed Suras**

| Sura No. | Frequency of "S" |
| --- | --- |
| 7 | 97 |
| 19 | 26 |
| 38 | 29 |
| Total | 152 (19×8) |

This is an erroneous distortion that violates the Quran’s code. By looking at the oldest available copy of the Quran, the Tashkent Copy, it was found that the word “Bastatan” is correctly written with a “Seen” (see photocopy below).

> Historical Note
>
> The momentous discovery that “19” is the Quran’s common denominator became a reality in January 1974, coinciding with Zul-Hijjah 1393 A.H. The Quran was revealed in 13 B.H. (Before Hijrah). This makes the number of years from the revelation of the Quran to the revelation of its miracle 1393 + 13 = 1406 = 19×74. As noted above, the unveiling of the Miracle took place in January 1974. The correlation between 19×74 lunar years and 1974 solar years could not escape notice. This is especially uncanny in view of the fact that “19” is mentioned in Sura 74.

## Y.S. (Ya Seen)

These two letters prefix Sura 36. The letter “Y” occurs in this sura 237 times, while the letter “S” (Seen) occurs 48 times. The total of both letters is 285, 19×15.

It is noteworthy that the letter “Y” is written in the Quran in two forms; one is obvious and the other is subtle. The subtle form of the letter may be confusing to those who are not thoroughly familiar with the Arabic language. A good example is the word “Araany” which is mentioned twice in [12:36]. The letter “Y” is used twice in this word, the first “Y” is subtle and the second is obvious. Sura 36 does not contain a single “Y” of the subtle type. This is a remarkable phenomenon, and one that does not normally occur in a long sura like Sura 36. In my book QURAN: VISUAL PRESENTATION OF THE MIRACLE (Islamic Productions, 1982) every “Y” and “S” in Sura 36 is marked with a star.

## H.M. (Ha Mim)

Seven suras are prefixed with the letters “H” and “M;” Suras 40 through 46. The total occurrence of these two letters in the seven H.M.-initialed suras is 2147, or 19×113. The detailed data are shown in Table 3.

Naturally, the alteration of a single letter “H” or “M” in any of the seven H.M.-initialed suras would have destroyed this intricate phenomenon.

**Table 3: Occurrence of the Letters "H" and "M" in the Seven H.M.-Initialed Suras**

| Sura No. | Freq. of "H" | Freq. of "M" | H + M |
| --- | --- | --- | --- |
| 40 | 64 | 380 | 444 |
| 41 | 48 | 276 | 324 |
| 42 | 53 | 300 | 353 |
| 43 | 44 | 324 | 368 |
| 44 | 16 | 150 | 166 |
| 45 | 31 | 200 | 231 |
| 46 | 36 | 225 | 261 |
| Total | 292 | 1855 | 2147 (19×113) |

## ‘A.S.Q. (‘Ayn Seen Qaf)

These initials constitute Verse 2 of Sura 42, and the total occurrence of these letters in this sura is 209, or 19×11. The letter “‘A” (‘Ayn) occurs 98 times, the letter “S” (Seen) occurs 54 times, and the letter “Q” (Qaf) occurs 57 times.

## A.L.M. (Alef Laam Mim)

The letters “A,” “L,” and “M” are the most frequently used letters in the Arabic language, and in the same order as we see in the Quranic Initials — “A,” then “L,” then “M.” These letters prefix six suras — 2, 3, 29, 30, 31, and 32 — and the total occurrence of the three letters in each of the six suras is a multiple of 19: 9899 (19×521), 5662 (19×298), 1672 (19×88), 1254 (19×66), 817 (19×43), and 570 (19×30), respectively. Thus, the total occurrence of the three letters in the six suras is 19874 (19×1046), and the alteration of one of these letters destroys this phenomenon.

**Table 4: Occurrence of the Letters "A," "L," and "M" in the A.L.M.-Initialed Suras**

| Sura No. | Freq. of "A" | Freq. of "L" | Freq. of "M" | Total |
| --- | --- | --- | --- | --- |
| 2 | 4502 | 3202 | 2195 | 9899 (19×521) |
| 3 | 2521 | 1892 | 1249 | 5662 (19×298) |
| 29 | 774 | 554 | 344 | 1672 (19×88) |
| 30 | 544 | 393 | 317 | 1254 (19×66) |
| 31 | 347 | 297 | 173 | 817 (19×43) |
| 32 | 257 | 155 | 158 | 570 (19×30) |
| Total | 8945 | 6493 | 4436 | 19874 (19×1046) |

## A.L.R. (Alef Laam Ra)

These initials are found in Suras 10, 11, 12, 14, and 15. The total occurrences of these letters in these suras are 2489 (19×131), 2489 (19×131), 2375 (19×125), 1197 (19×63), and 912 (19×48), respectively (Table 5).

**Table 5: Occurrence of the Letters "A," "L," and "R" in the A.L.R.-Initialed Suras**

| Sura No. | Freq. of "A" | Freq. of "L" | Freq. of "R" | Total |
| --- | --- | --- | --- | --- |
| 10 | 1319 | 913 | 257 | 2489 (19×131) |
| 11 | 1370 | 794 | 325 | 2489 (19×131) |
| 12 | 1306 | 812 | 257 | 2375 (19×125) |
| 14 | 585 | 452 | 160 | 1197 (19×63) |
| 15 | 493 | 323 | 96 | 912 (19×48) |
| Total | 5073 | 3294 | 1095 | 9462 (19×498) |

## A.L.M.R. (Alef Laam Mim Ra)

These initials prefix one sura, No. 13, and the total frequency of occurrence of the four letters is 1482, or 19×78. The letter “A” occurs 605 times, “L” occurs 480 times, “M” occurs 260 times, and “R” occurs 137 times.

## A.L.M.S. (Alef Laam Mim Saad)

Only one sura is prefixed with these initials, Sura 7, and the letter “A” occurs in this sura 2529 times, “L” occurs 1530 times, “M” occurs 1164 times, and “S” (Saad) occurs 97 times. Thus, the total occurrence of the four letters in this sura is 2529 + 1530 + 1164 + 97 = 5320 = 19×280.

An important observation here is the interlocking relationship involving the letter “S” (Saad). This letter occurs also in Suras 19 and 38. While complementing its sister letters in Sura 7 to give a total that is divisible by 19, the frequency of this letter also complements its sister letters in Suras 19 and 38 to give a multiple of 19 (see Page 380).

Additionally, the Quranic Initial “S” (Saad) interacts with the Quranic Initials “K.H.Y.‘A.” (Kaaf Ha Ya ‘Ayn) in Sura 19 to give another total that is also a multiple of 19 (see Page 383). This interlocking relationship — which is not unique to the initial “S” (Saad) — contributes to the intricacy of the Quran’s numerical code.

## K.H.Y.‘A.S. (Kaaf Ha Ya ‘Ayn Saad)

This is the longest set of initials, consisting of five letters, and it occurs in one sura, Sura 19. The letter “K” in Sura 19 occurs 137 times, “H” occurs 175 times, “Y” occurs 343 times, “‘A” occurs 117 times, and “S” (Saad) occurs 26 times. Thus, the total occurrence of the five letters is 137 + 175 + 343 + 117 + 26 = 798 = 19×42.

## H., T.H. (Ta Ha), T.S. (Ta Seen) & T.S.M. (Ta Seen Mim)

An intricate interlocking relationship links these overlapping Quranic Initials to produce a total that is also a multiple of 19. The initial “H.” is found in Suras 19 and 20. The initials “T.H.” prefix Sura 20. The initials “T.S.” are found in Sura 27, while the initials “T.S.M.” prefix its surrounding Suras 26 & 28.

It should be noted at this time that the longer, more complex, interlocking and overlapping initials are found in the suras where uncommonly powerful miracles are narrated. For example, the virgin birth of Jesus is given in Sura 19, which is prefixed with the longest set of initials, K.H.Y.‘A.S.

The interlocking initials “H.,” “T.H.,” “T.S.,” and “T.S.M.” prefix suras describing the miracles of Moses, Jesus, and the uncommon occurrences surrounding Solomon and his jinns. God thus provides stronger evidence to support stronger miracles. The frequencies of occurrence of these initials are presented in Table 6.

**Table 6: Occurrence of the Quranic Initials "H.," "T.H.," "T.S.," and "T.S.M." in Their Suras**

| Sura | Freq. of "H" | Freq. of "T" | Freq. of "S" | Freq. of "M" |
| --- | --- | --- | --- | --- |
| 19 | 175 | — | — | — |
| 20 | 251 | 28 | — | — |
| 26 | — | 33 | 94 | 484 |
| 27 | — | 27 | 94 | — |
| 28 | — | 19 | 102 | 460 |
| Total | 426 | 107 | 290 | 944 |

> 426 + 107 + 290 + 944 = 1767 = 19×93

## What Is a “Gematrical Value”?

When the Quran was revealed, 14 centuries ago, the numbers known today did not exist. A universal system was used where the letters of the Arabic, Hebrew, Aramaic, and Greek alphabets were used as numerals. The number assigned to each letter is its “Gematrical Value.” The numerical values of the Arabic alphabet are shown in Table 7.

**Table 7: Gematrical Values of the Arabic Alphabet**

| Letter | Value | Letter | Value | Letter | Value |
| --- | --- | --- | --- | --- | --- |
| Alef (ا) | 1 | Kaf (ك) | 20 | Qaf (ق) | 100 |
| Ba' (ب) | 2 | Laam (ل) | 30 | Ra' (ر) | 200 |
| Jim (ج) | 3 | Mim (م) | 40 | Shin (ش) | 300 |
| Dal (د) | 4 | Noon (ن) | 50 | Ta' (ت) | 400 |
| Ha' (ه) | 5 | Seen (س) | 60 | Tha' (ث) | 500 |
| Waw (و) | 6 | Ayn (ع) | 70 | Kha' (خ) | 600 |
| Zay (ز) | 7 | Fa' (ف) | 80 | Dhal (ذ) | 700 |
| Ha' (ح) | 8 | Saad (ص) | 90 | Dad (ض) | 800 |
| TTa' (ط) | 9 | — | — | Za' (ظ) | 900 |
| Ya' (ي) | 10 | — | — | Ghayn (غ) | 1000 |

## Other Mathematical Properties of the Initialed Suras

Fourteen Arabic letters, half the Arabic alphabet, participate in the formation of 14 different sets of Quranic Initials. By adding the gematrical value of each one of these letters, plus the number of suras which are prefixed with Quranic Initials (29), we obtain a total of 722, or 19×19×2.

Additionally, if we add the total gematrical value of all 14 initials, plus the number of the first sura where the initial occurs, we get a grand total of 988, 19×52. Table 8 presents these data.

**Table 8: The 14 Letters Used in Forming Quranic Initials**

| Letter | Value | First Sura |
| --- | --- | --- |
| A (Alef) | 1 | 2 |
| L (Laam) | 30 | 2 |
| M (Mim) | 40 | 2 |
| S (Saad) | 90 | 7 |
| R (Ra) | 200 | 10 |
| K (Kaf) | 20 | 19 |
| H (Ha) | 5 | 19 |
| Y (Ya) | 10 | 19 |
| 'A ('Ayn) | 70 | 19 |
| T (Ta) | 9 | 20 |
| S (Seen) | 60 | 26 |
| H (HHa) | 8 | 40 |
| Q (Qaf) | 100 | 42 |
| N (Noon) | 50 | 68 |
| Total | 693 | 295 |

> 693 + 295 = 988 = 19×52
>
> also 693 + 29 (suras) = 722 = 19×19×2

If we add the number of occurrences of each of the 14 letters listed in Table 8 as an initial, plus the numbers of the suras where it occurs as an initial, the Grand Total comes to 2033, 19×107. See Table 9.

**Table 9: Mathematically Structured Distribution of the Quranic Initials**

| Initial | No. of Occurrences | Suras Where It Occurs | Total |
| --- | --- | --- | --- |
| A (Alef) | 13 | 2+3+7+10+11+12+13+14+15+29+30+31+32 | 222 |
| L (Laam) | 13 | 2+3+7+10+11+12+13+14+15+29+30+31+32 | 222 |
| M (Mim) | 17 | 2+3+7+13+26+28+29+30+31+32+40+41+42+43+44+45+46 | 519 |
| S (Saad) | 3 | 7+19+38 | 67 |
| R (Ra) | 6 | 10+11+12+13+14+15 | 81 |
| K (Kaf) | 1 | 19 | 20 |
| H (Ha) | 2 | 19+20 | 41 |
| Y (Ya) | 2 | 19+36 | 57 |
| 'A ('Ayn) | 2 | 19+42 | 63 |
| T (Ta) | 4 | 20+26+27+28 | 105 |
| S (Seen) | 5 | 26+27+28+36+42 | 164 |
| H (HHa) | 7 | 40+41+42+43+44+45+46 | 308 |
| Q (Qaf) | 2 | 42+50 | 94 |
| N (Noon) | 2 | 68 | 70 |
| Total | 79 | 1954 | 2033 (19×107) |

Table 10 presents the total frequency of Quranic Initials, plus the total gematrical value of these letters in the whole sura. The Grand Total for all initialed suras is 1089479. This number, in excess of one million, is a multiple of 19 (1089479 = 19 × 57341). The slightest alteration or distortion destroys the system.

**Table 10: Total Gematrical Values of All Quranic Initials In Their Suras**

| Suras | Initials | Frequency of Initials | Total Value in Whole Sura |
| --- | --- | --- | --- |
| 2 | A.L.M. | 9899 | 188362 |
| 3 | A.L.M. | 5662 | 109241 |
| 7 | A.L.M.S | 5320 | 103719 |
| 10 | A.L.R. | 2489 | 80109 |
| 11 | A.L.R. | 2489 | 90190 |
| 12 | A.L.R. | 2375 | 77066 |
| 13 | A.L.M.R. | 1482 | 52805 |
| 14 | A.L.R. | 1197 | 46145 |
| 15 | A.L.R. | 912 | 29383 |
| 19 | K.H.Y.'A.S. | 798 | 17575 |
| 20 | T.H. | 279 | 1507 |
| 26 | T.S.M. | 611 | 25297 |
| 27 | T.S. | 121 | 5883 |
| 28 | T.S.M. | 581 | 24691 |
| 29 | A.L.M. | 1672 | 31154 |
| 30 | A.L.M. | 1254 | 25014 |
| 31 | A.L.M. | 817 | 16177 |
| 32 | A.L.M. | 570 | 11227 |
| 36 | Y.S. | 285 | 5250 |
| 38 | S. | 29 | 2610 |
| 40 | H.M. | 444 | 15712 |
| 41 | H.M. | 324 | 11424 |
| 42 | H.M.-'A.S.Q. | 562 | 28224 |
| 43 | H.M. | 368 | 13312 |
| 44 | H.M. | 166 | 6128 |
| 45 | H.M. | 231 | 8248 |
| 46 | H.M. | 261 | 9288 |
| 50 | Q | 57 | 5700 |
| 68 | N,N | 133 | 6650 |
| Total |   | 41388 | 1048091 |

> 41388 + 1048091 = 1089479 (19 × 57341)

> Note: The total gematrical value of the Quranic Initials in a given sura equals the gematrical value of each initial multiplied by the frequency of occurrence of that initial in the sura.

It is noteworthy that the initial “N” must be counted as two N’s. This reflects the fact that the original Quranic text spells out this initial with 2 N’s.

## Major Parameters of the Quranic Initials (Suras, Verses, Frequency, First Sura, & Last Sura)

Table 11 shows that the sum of numbers of suras and verses where the Quranic Initials are found, plus the initial’s frequency of occurrence in that sura, plus the number of the first sura where the initials occur, plus the number of the last sura where the initials occur, produces a total that equals 44232, or 19×2328. Thus, the distribution of the Quranic Initials in the initialed suras is so intricate that their counts and their placement within suras are intertwined to give a grand total that is a multiple of 19.

**Table 11: Parameters of the 14 Individual Quranic Initials**

| Initial | Sura, Verse, & (Frequency) of Initial in Each Sura | First Sura | Last Sura |
| --- | --- | --- | --- |
| A (Alef) | 2:1 (4502), 3:1 (2521), 7:1 (2529), 10:1 (1319), 11:1 (1370), 12:1 (1306), 13:1 (605), 14:1 (585), 15:1 (493), 29:1 (774), 30:1 (544), 31:1 (347), 32:1 (257) | 2 | 32 |
| L (Laam) | 2:1 (3202), 3:1 (1892), 7:1 (1530), 10:1 (913), 11:1 (794), 12:1 (812), 13:1 (480), 14:1 (452), 15:1 (323), 29:1 (554), 30:1 (393), 31:1 (297), 32:1 (155) | 2 | 32 |
| M (Mim) | 2:1 (2195), 3:1 (1249), 7:1 (1164), 13:1 (260), 26:1 (484), 28:1 (460), 29:1 (344), 30:1 (317), 31:1 (173), 32:1 (158), 40:1 (380), 41:1 (276), 42:1 (300), 43:1 (324), 44:1 (150), 45:1 (200), 46:1 (225) | 2 | 46 |
| S (Saad) | 7:1 (97), 19:1 (26), 38:1 (29) | 7 | 38 |
| R (Ra) | 10:1 (257), 11:1 (325), 12:1 (257), 13:1 (137), 14:1 (160), 15:1 (96) | 10 | 15 |
| K (Kaf) | 19:1 (137) | 19 | 19 |
| H (Ha) | 19:1 (175), 20:1 (251) | 19 | 20 |
| Y (Ya) | 19:1 (343), 36:1 (237) | 19 | 36 |
| 'A ('Ayn) | 19:1 (117), 42:2 (98) | 19 | 42 |
| T (Ta) | 20:1 (28), 26:1 (33), 27:1 (27), 28:1 (19) | 20 | 28 |
| S (Seen) | 26:1 (94), 27:1 (94), 28:1 (102), 36:1 (48), 42:2 (54) | 26 | 42 |
| H (HHa) | 40:1 (64), 41:1 (48), 42:1 (53), 43:1 (44), 44:1 (16), 45:1 (31), 46:1 (36) | 40 | 46 |
| Q (Qaf) | 42:2 (57), 50:1 (57) | 42 | 50 |
| N (NuN) | 68:1 (133) | 68 | 68 |
| Total | 43423 | 295 | 514 |

> Grand Total = 43423 + 295 + 514 = 44232 = 19×2328

A special mathematical coding authenticates the number of verses where the Quranic Initials themselves are found. As detailed in Table 11, all Quranic Initials occur in Verse 1, except in Sura 42 (initials in Verses 1 and 2). This fact is supported by the remarkable mathematical phenomenon detailed in Table 12. If we multiply the first two columns of Table 12, instead of adding, we still end up with a Total that is divisible by 19 (see Table 13).

**Table 12: Mathematical Coding of the Number of Verses with Initials**

| Sura No. | No. of Initials | Initialed Verses |
| --- | --- | --- |
| 2 | 3 | 1 |
| 3 | 3 | 1 |
| 7 | 4 | 1 |
| 10 | 3 | 1 |
| 11 | 3 | 1 |
| 12 | 3 | 1 |
| 13 | 4 | 1 |
| 14 | 3 | 1 |
| 15 | 3 | 1 |
| 19 | 5 | 1 |
| 20 | 2 | 1 |
| 26 | 3 | 1 |
| 27 | 2 | 1 |
| 28 | 3 | 1 |
| 29 | 3 | 1 |
| 30 | 3 | 1 |
| 31 | 3 | 1 |
| 32 | 3 | 1 |
| 36 | 2 | 1 |
| 38 | 1 | 1 |
| 40 | 2 | 1 |
| 41 | 2 | 1 |
| 42 | 5 | 2 |
| 43 | 2 | 1 |
| 44 | 2 | 1 |
| 45 | 2 | 1 |
| 46 | 2 | 1 |
| 50 | 1 | 1 |
| 68 | 2 | 1 |
| Total | 79 | 30 |

> 822 + 79 + 30 = 931 (19×49)
>
> (822 = sum of the sura numbers in the first column)

**Table 13: Multiplying the First Two Columns of Table 12, Instead of Adding (Sura № × № of Initials)**

| Sura No. | No. of Initials | Initialed Verses |
| --- | --- | --- |
| 2 | 3 | 1 |
| 3 | 3 | 1 |
| 7 | 4 | 1 |
| — | — | — |
| 42 | 5 | 2 |
| — | — | — |
| 50 | 1 | 1 |
| 68 | 2 | 1 |
| Total | 2022 | 30 |

> 2022 + 30 = 2052 (19×108)

Obviously, it is crucial to have two different initialed verses in Sura 42 in order to conform with the Quran’s mathematical code. The fact that Verse 1 of Sura 42 consists of the two Quranic Initials “H.M.” and the second verse consists of the three Initials “‘A.S.Q.” has perplexed Muslim scholars and orientalists for 14 centuries.

By the end of this Appendix, the reader will see that every element of the Quran is mathematically authenticated. The elements we are dealing with now are “the number of Quranic Initials in each initialed sura” and “the number of verses that contain Quranic Initials.” Tables 11 through 13 have dealt with these two elements.

Additional mathematical authentication is shown in Tables 14 and 15. In Table 14, we have the numbers of all initialed suras added to the number of verses in each sura, plus the number of verses containing initials, plus the gematrical values of those initials. The Grand Total is 7030, or 19×370.

**Table 14: Mathematical Properties of the Initialed Suras**

| Sura Number | No. of Verses | No. of Initialed Verses | Gematrical Value of the Initials | TOTAL |
| --- | --- | --- | --- | --- |
| 2 | 286 | 1 | 71 | 360 |
| 3 | 200 | 1 | 71 | 275 |
| 7 | 206 | 1 | 161 | 375 |
| 10 | 109 | 1 | 231 | 351 |
| 11 | 123 | 1 | 231 | 366 |
| 12 | 111 | 1 | 231 | 355 |
| 13 | 43 | 1 | 271 | 328 |
| 14 | 52 | 1 | 231 | 298 |
| 15 | 99 | 1 | 231 | 346 |
| 19 | 98 | 1 | 195 | 313 |
| 20 | 135 | 1 | 14 | 170 |
| 26 | 227 | 1 | 109 | 363 |
| 27 | 93 | 1 | 69 | 190 |
| 28 | 88 | 1 | 109 | 226 |
| 29 | 69 | 1 | 71 | 170 |
| 30 | 60 | 1 | 71 | 162 |
| 31 | 34 | 1 | 71 | 137 |
| 32 | 30 | 1 | 71 | 134 |
| 36 | 83 | 1 | 70 | 190 |
| 38 | 88 | 1 | 90 | 217 |
| 40 | 85 | 1 | 48 | 174 |
| 41 | 54 | 1 | 48 | 144 |
| 42 | 53 | 2 | 278 | 375 |
| 43 | 89 | 1 | 48 | 181 |
| 44 | 59 | 1 | 48 | 152 |
| 45 | 37 | 1 | 48 | 131 |
| 46 | 35 | 1 | 48 | 130 |
| 50 | 45 | 1 | 100 | 196 |
| 68 | 52 | 1 | 50 + 50 | 221 |
| Total | 2743 | 30 | 3435 | 7030 (19×370) |

> 822 + 2743 + 30 + 3435 = 7030 (19×370)
>
> (822 = sum of the sura numbers)

Remarkably, if we multiply the first two columns of Table 14, instead of adding them, we still get a Grand Total that is divisible by 19 (Table 15).

The number of verses per sura, and the numbers assigned to each verse are among the basic elements of the Quran. Not only are these elements authenticated mathematically, but both initialed and un-initialed suras are independently coded. Since we are now dealing with the initialed suras, Table 16 presents the numbers assigned to these suras, added to the numbers of verses in each sura, plus the sum of verse numbers (1+2+3+ ... + n). The Grand Total is 190133, or 19×10007.

**Table 15: Multiplying the First 2 Columns of Table 14, Instead of Adding Them**

| Sura Number | No. of Verses | No. of Initialed Verses | Gematrical Value of the Initials | TOTAL |
| --- | --- | --- | --- | --- |
| 2 | × 286 | \+ 1 | \+ 71 | = 644 |
| 3 | × 200 | \+ 1 | \+ 71 | = 672 |
| 7 | × 206 | \+ 1 | \+ 161 | = 1604 |
| — | — | — | — | — |
| 50 | × 45 | \+ 1 | \+ 100 | = 2351 |
| 68 | × 52 | \+ 1 | \+ (50+50) | = 3637 |
| Total | 60071 | 30 | 3435 | 63536 (19×3344) |

**Table 16: Mathematical Structuring of the Verses of Initialed Suras**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 2 | 286 | 41041 | 41329 |
| 3 | 200 | 20100 | 20303 |
| 7 | 206 | 21321 | 21534 |
| — | — | — | — |
| 50 | 45 | 1035 | 1130 |
| 68 | 52 | 1378 | 1498 |
| Total | 2743 | 186568 | 190133 (19×10007) |

By adding the number of every sura to the number of the next sura, and accumulating the sums of sura numbers as we continue this process to the end of the Quran, we will have a value that corresponds to each sura. Thus, Sura 1 will have a corresponding value of 1, Sura 2 will have a value of 1+2=3, Sura 3 will have a value of 3+3=6, Sura 4 will have a value of 6+4 = 10, and so on to the end of the Quran. The total values for the initialed and the un-initialed suras are independently divisible by 19. The values for the initialed suras are shown in Table 17.

**Table 17: Values Obtained by Successive Addition of Sura Numbers**

| Sura Number | Calculated Value |
| --- | --- |
| 2 | 3 |
| 3 | 6 |
| 7 | 28 |
| 10 | 55 |
| 11 | 66 |
| 12 | 78 |
| 13 | 91 |
| 14 | 105 |
| 15 | 120 |
| 19 | 190 |
| 20 | 210 |
| — | — |
| 44 | 990 |
| 45 | 1035 |
| 46 | 1081 |
| 50 | 1275 |
| 68 | 2346 |
| Total | 15675 (19×825) |

The values calculated for the un-initialed suras add up to a total of 237785, which is also a multiple of 19 (237785 = 19×12515).

## Mathematical Coding of Special Words — The Word “God” (Allah)

1. As shown earlier the word “God” occurs in the Quran 2698 times, 19×142.
2. The numbers of verses where the word “God” occurs add up to 118123, also a multiple of 19 (118123 = 19×6217).

These simple phenomena gave us many difficulties while simply counting the word “God.” We were a group of workers, equipped with computers, and all of us college graduates. Yet, we made several errors in counting, calculating, or simply writing the counts of the word “God.” Those who still claim that Muhammad was the author of the Quran are totally illogical; he never went to college, and he did not have a computer.

1. From the first Quranic Initials (A.L.M. 2:1) to the last initial (N. 68:1), there are 2641, 19×139, occurrences of the word “God.”
2. The word “God” occurs 57 times in the section outside the Initials (Table 18).
3. By adding the numbers of the suras and verses where these 57 occurrences of the word “God” are found, we get a total of 2432, or 19×128. See Table 18.
4. The word “God” occurs in 85 suras. If we add the number of each sura to the number of verses between the first and last occurrences of the word “God,” both verses inclusive, the Grand Total comes to 8170 or 19×430. An abbreviated representation of the data is shown in Table 19.

**Table 18: Occurrence of the Word "God" outside the Initialed Section**

| Number of Sura | Numbers of Verses | Number of Occurrences |
| --- | --- | --- |
| 1 | 1, 2 | 2 |
| 69 | 33 | 1 |
| 70 | 3 | 1 |
| 71 | 3, 4, 13, 15, 17, 19, 25 | 7 |
| 72 | 4, 5, 7, 12, 18, 19, 22, 23 | 10 |
| 73 | 20 | 7 |
| 74 | 31, 56 | 3 |
| 76 | 6, 9, 11, 30 | 5 |
| 79 | 25 | 1 |
| 81 | 29 | 1 |
| 82 | 19 | 1 |
| 84 | 23 | 1 |
| 85 | 8, 9, 20 | 3 |
| 87 | 7 | 1 |
| 88 | 24 | 1 |
| 91 | 13 | 2 |
| 95 | 8 | 1 |
| 96 | 14 | 1 |
| 98 | 2, 5, 8 | 3 |
| 104 | 6 | 1 |
| 110 | 1, 2 | 2 |
| 112 | 1, 2 | 2 |
| Total | 1798 + 634 | 57 (19×3) |

> Sum of numbers of the suras & verses = 1798 + 634 = 2432 = 19×128
>
> Total occurrence of the word “God” outside the initialed section = 57 (19×3)

**Table 19: All Suras in Which the Word "God" (Allah) Is Mentioned**

| No. | Sura No. | First Verse | Last Verse | \# Verses From First to Last |
| --- | --- | --- | --- | --- |
| 1\. | 1 | 1 | 2 | 2 |
| 2\. | 2 | 7 | 286 | 280 |
| 3\. | 3 | 2 | 200 | 199 |
| — | — | — | — | — |
| 83\. | 104 | 6 | — | 1 |
| 84\. | 110 | 1 | 2 | 2 |
| 85\. | 112 | 1 | 2 | 2 |
| Total | 3910 |   |   | 4260 |

> 3910 + 4260 = 8170 = 19×430
>
> These mathematical properties cover all occurrences of the word “God.”

[7] The Quran’s dominant message is that there is only “One God.” The word “One,” in Arabic “Wahed” occurs in the Quran 25 times. Six of these occurrences refer to other than God (one kind of food, one door, etc.). The other 19 occurrences refer to God. These data are found in the classic reference INDEX TO THE WORDS OF QURAN.

The crucial importance of the word “ONE” as the Quran’s basic message is manifested in the fact that the Quran’s common denominator, 19, happens to be the gematrical value of the word “ONE” (Wahed): W(6) + A(1) + H(8) + D(4) = 19.

## Why 19!

As pointed out later in this Appendix, all God’s scriptures, not only the Quran, were mathematically coded with the number “19.” Even the universe at large bears this divine mark. The number 19 can be looked upon as the Almighty Creator’s signature on everything He created (see Appendix 38). The number “19” possesses unique mathematical properties beyond the scope of this Appendix. For example:

1. It is a prime number.
2. It encompasses the first numeral (1) and the last numeral (9), as if to proclaim God’s attribute in 57:3 as the “Alpha and the Omega.”
3. It looks the same in all languages of the world. Both components, 1 and 9, are the only numerals that look the same in all languages.

> The Lord our God is ONE! Therefore, you shall worship the Lord your God with all your heart, with all your soul, with all your mind, and with all your strength.
>
> [Deuteronomy 6:4-5] [Mark 12:29] [Quran 2:163, 17:22-23]

1. It possesses many peculiar mathematical properties. For example, 19 is the sum of the first powers of 9 and 10, and the difference between the second powers of 9 and 10.

We now understand that the universal coding of God’s creations with the number 19 rests in the fact that it is the gematrical value of the word “ONE” in all the scriptural languages — Aramaic, Hebrew, and Arabic.

**Table 20: Why 19!**

| Letter (Hebrew) | Letter (Arabic) | Value |
| --- | --- | --- |
| V | W | 6 |
| A | A | 1 |
| H | H | 8 |
| D | D | 4 |
| Total |   | 19 |

The number 19, therefore, proclaims the First Commandment in all the scriptures: that there is only ONE God.

As shown in Table 7, the Aramaic, Hebrew, and Arabic alphabets used to double as numerals in accordance with a universally established system. The Hebrew word for “ONE” is “VAHD” (pronounced V-AHAD). In Arabic, the word for “ONE” is “WAHD” (pronounced WAAHED). See Table 20.

## The Word “Quran”

The word “Quran” occurs in the Quran 58 times, with one of them, in 10:15, referring to “another Quran.” This particular occurrence, therefore, must be excluded. Thus, the frequency of occurrence of “this Quran” in the Quran is 57, or 19×3.

**Table 21: Suras and Verses Where "Quran" Occurs**

| Sura | Verse |
| --- | --- |
| 2 | 185 |
| 4 | 82 |
| 5 | 101 |
| 6 | 19 |
| 7 | 204 |
| 9 | 111 |
| 10 | 37 |
| – | 61 |
| 12 | 2 |
| – | 3 |
| 15 | 1 |
| – | 87 |
| – | 91 |
| 16 | 98 |
| 17 | 9 |
| – | 41 |
| – | 45 |
| – | 46 |
| – | 60 |
| – | 78 |
| – | 82 |
| – | 88 |
| – | 89 |
| – | 106 |
| 18 | 54 |
| 20 | 2 |
| – | 113 |
| – | 114 |
| 25 | 30 |
| – | 32 |
| 27 | 1 |
| – | 6 |
| – | 76 |
| – | 92 |
| 28 | 85 |
| 30 | 58 |
| 34 | 31 |
| 36 | 2 |
| – | 69 |
| 38 | 1 |
| 39 | 27 |
| – | 28 |
| 41 | 3 |
| – | 26 |
| 42 | 7 |
| 43 | 3 |
| – | 31 |
| 46 | 29 |
| 47 | 24 |
| 50 | 1 |
| – | 45 |
| 54 | 17 |
| – | 22 |
| – | 32 |
| – | 40 |
| 55 | 2 |
| 56 | 77 |
| 59 | 21 |
| 72 | 1 |
| 73 | 4 |
| – | 20 |
| 75 | 17 |
| – | 18 |
| 76 | 23 |
| 84 | 21 |
| 85 | 21 |
| Total | 1356 + 3052 = 4408 (19×232) |

Two other grammatical forms of the word “Quran” occur in 12 verses. These include the word “Quranun” and the word “Quranahu.” One of these occurrences, in 13:31 refers to “another Quran” that cause the mountains to crumble. Another occurrence, in 41:44, refers to “a non-Arabic Quran.” These two occurrences, therefore, are excluded. Table 21 shows a list of the suras and verses where the word “Quran,” in all its grammatical forms, occurs.

## A Strong Foundation

The Quran’s first verse, “In the Name of God, Most Gracious, Most Merciful,” known as Basmalah, consists of 19 Arabic letters. Its constituent words occur in the Quran consistently in multiples of 19.

**Frequency of the Basmalah's Four Words**

| Word | Occurrences | Multiple of 19 |
| --- | --- | --- |
| The first word — "Ism" (Name) | 19 | 19 × 1 |
| The second word — "Allah" (God) | 2,698 | 19 × 142 |
| The third word — "Al-Rahman" (Most Gracious) | 57 | 19 × 3 |
| The fourth word — "Al-Raheem" (Most Merciful) | 114 | 19 × 6 |

Professor Cesar Majul looked at the gematrical value of more than 400 attributes of God, and found only four names whose gematrical values are multiples of 19:

| Divine Name | Gematrical Value |
| --- | --- |
| 1\. "Waahed" (One) | 19 |
| 2\. "Zul Fadl Al-'Azim" (Possessor of Infinite Grace) | 2698 |
| 3\. "Majid" (Glorious) | 57 |
| 4\. "Jaami'" (Summoner) | 114 |

As noted above, the only Divine Names whose gematrical values are divisible by 19 correspond exactly to the frequencies of occurrence of the Basmalah’s four words. The four words of Basmalah, the frequencies of occurrence of those words, and the only four divine names whose gematrical values are divisible by 19, all share the same four numbers: 19, 2698, 57, and 114.

## The Five Pillars of Islam

Although the Quran provides numerous important commandments governing all aspects of our lives (see for example 17:22-38), five basic “pillars” have been traditionally emphasized. They are:

- Shahaadah: Bearing witness that there is no other god besides God.
- Salat: Observing five daily Contact Prayers.
- Seyaam: Fasting during the ninth month of the Islamic calendar (Ramadan).
- Zakat: Giving away 2.5% of one’s net income as a charity to specified people.
- Hajj: Pilgrimage to Mecca once in a lifetime for those who can afford it.

Like everything else in the Quran, these are mathematically structured.

1\. One God (Shahaadah)

As mentioned earlier, the word “ONE” that refers to God occurs in the Quran 19 times. The reference to God “ALONE” occurs 5 times, and the sum of the sura and verse numbers where we find these five occurrences is 361, 19×19.

**Table 22: All Suras and Verses from First Occurrence of LAA ELAAHA ELLA HOO to the Last Occurrence**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 2 | 123 | 27675 | 27800 |
| 3 | 200 | 20100 | 20303 |
| — | — | — | — |
| 9 | 127 | 8128 | 8264 |
| — | — | — | — |
| 72 | 28 | 406 | 506 |
| 73 | 9 | 45 | 127 |
| Total | 5312 | 308490 | 316502 (19×16658) |

The “First Pillar of Islam” is stated in 3:18 as “LAA ELAAHA ELLA HOO” (There is no other god besides Him). This most important expression occurs in 19 suras. The first occurrence is in 2:163, and the last occurrence is in 73:9. Table 22 shows that the total of sura numbers, plus the number of verses between the first and last occurrences, plus the sum of these verse numbers is 316502, or 19×16658.

Also, by adding the numbers of the 19 suras where LAA ELAAHA ELLA HOO occurs, plus the verse numbers where this crucial expression is found, plus the total number of occurrences (29), the Grand Total comes to 2128, or 19×112. The details are shown in Table 23.

**Table 23: List of All Occurrences of the Crucial Phrase "LAA ELAAHA ELLA HOO" (There is no other god besides Him)**

| No. | Sura No. | Verses with Shahadah | Frequency of Shahadah |
| --- | --- | --- | --- |
| 1\. | 2 | 163, 255 | 2 |
| 2\. | 3 | 2, 6, 18, 18 | 4 |
| 3\. | 4 | 87 | 1 |
| 4\. | 6 | 102, 106 | 2 |
| 5\. | 7 | 158 | 1 |
| 6\. | 9 | 31 | 1 |
| 7\. | 11 | 14 | 1 |
| 8\. | 13 | 30 | 1 |
| 9\. | 20 | 8, 98 | 2 |
| 10\. | 23 | 116 | 1 |
| 11\. | 27 | 26 | 1 |
| 12\. | 28 | 70, 88 | 2 |
| 13\. | 35 | 3 | 1 |
| 14\. | 39 | 6 | 1 |
| 15\. | 40 | 3, 62, 65 | 3 |
| 16\. | 44 | 8 | 1 |
| 17\. | 59 | 22, 23 | 2 |
| 18\. | 64 | 13 | 1 |
| 19\. | 73 | 9 | 1 |
| Total | 507 | 1592 | 29 |

> 507 + 1592 + 29 = 2128 = 19×112

2\. The Contact Prayers (Salat)

The word “Salat” occurs in the Quran 67 times, and when we add the numbers of suras and verses of these 67 occurrences, the total comes to 4674, or 19×246 (see INDEX OF THE QURAN).

3\. Fasting (Seyaam)

The commandment to fast is mentioned in 2:183, 184, 185, 187, 196; 4:92; 5:89, 95; 33:35, 35; & 58:4. The total of these numbers is 1387, or 19×73. It is noteworthy that 33:35 mentions fasting twice, one for the believing men, and the other for the believing women.

4\. The Obligatory Charity (Zakat) & 5. Hajj Pilgrimage to Mecca

While the first three “Pillars of Islam” are obligatory upon all Muslim men and women, the Zakat and Hajj are decreed only for those who can afford them. This explains the interesting mathematical phenomenon associated with Zakat and Hajj.

The Zakat charity is mentioned in 2:43, 83, 110, 177, 277; 4:77, 162; 5:12, 55; 7:156; 9:5, 11, 18, 71; 18:81; 19:13, 31, 55; 21:73; 22:41, 78; 23:4; 24:37, 56; 27:3; 30:39; 31:4; 33:33; 41:7; 58:13; 73:20; and 98:5. These numbers add up to 2395. This total does not quite make it as a multiple of 19; it is up by 1.

The Hajj Pilgrimage occurs in 2:189, 196, 197; 9:3; and 22:27. These numbers add up to 645, and this total does not quite make it as a multiple of 19; it is down by 1.

Thus, Zakat and Hajj, together, give a total of 2395 + 645 = 3040 = 19×160.

## The Quran’s Mathematical Structure

The Quran’s suras, verses, words, and letters are not only mathematically composed, but also arranged into a superhuman structure that is purely mathematical, i.e., the literary content has nothing to do with such an arrangement.

Since the physical construction of the Quran is purely mathematical, it would be expected that the numbers mentioned in the Quran must conform with the Quran’s 19-based code.

A total of 30 unique numbers are mentioned throughout the Quran, and the sum of all these numbers is 162146, a multiple of 19 (162146 = 19×8534). Table 24 lists all the numbers mentioned in the Quran, without the repetitions.

**Table 24: All the Quranic Numbers**

| Number | Location Example |
| --- | --- |
| 1 | 2:163 |
| 2 | 4:11 |
| 3 | 4:171 |
| 4 | 9:2 |
| 5 | 18:22 |
| 6 | 25:59 |
| 7 | 41:12 |
| 8 | 69:17 |
| 9 | 27:48 |
| 10 | 2:196 |
| 11 | 12:4 |
| 12 | 9:36 |
| 19 | 74:30 |
| 20 | 8:65 |
| 30 | 7:142 |
| 40 | 7:142 |
| 50 | 29:14 |
| 60 | 58:4 |
| 70 | 9:80 |
| 80 | 24:4 |
| 99 | 38:23 |
| 100 | 2:259 |
| 200 | 8:65 |
| 300 | 18:25 |
| 1000 | 2:96 |
| 2000 | 8:66 |
| 3000 | 3:124 |
| 5000 | 3:125 |
| 50000 | 70:4 |
| 100000 | 37:147 |
| Total | 162146 (19 × 8534) |

The numbers which are mentioned only once in the Quran are: 11, 19, 20, 50, 60, 80, 99, 300, 2000, 3000, 5000, 50000, and 100000.

All the numbers mentioned in the Quran, with repetitions, occur 285 times, and this number is a multiple of 19; 285 = 19×15.

The Numbers of Suras and Verses

The numbering system of the Quran’s suras and verses has been perfectly preserved. Only a few unauthorized and easily detectable printings deviate from the standard system that is divinely guarded.

When we add the numbers of all suras, plus the number of verses in every sura, plus the sum of verse numbers, the Grand total for the whole Quran comes to 346199, 19×19×959. Table 25 is an abbreviated presentation of these data. Thus, the slightest alteration of a single sura or verse would have destroyed this system. As shown in Table 16, if we consider only the 29 initialed suras, these same data produce a Grand Total which is also a multiple of 19. It follows that the data for the un-initialed suras are also divisible by 19. Table 26 is an abbreviated presentation of the same data related to the 85 un-initialed suras.

**Table 25: Mathematical Coding of the Sura and Verse Numbers**

| Sura No. | No. of Verses | Sum of Verse #s | TOTAL |
| --- | --- | --- | --- |
| 1 | 7 | 28 | 36 |
| 2 | 286 | 41041 | 41329 |
| — | — | — | — |
| 9 | 127 | 8128 | 8264 |
| — | — | — | — |
| 113 | 5 | 15 | 133 |
| 114 | 6 | 21 | 141 |
| Total | 6234 | 333410 | 346199 (19×19×959) |

**Table 26: Mathematical Coding of the 85 Un-initialed Suras**

| Sura No. | No. of Verses | Sum of Verse #s | TOTAL |
| --- | --- | --- | --- |
| 1 | 7 | 28 | 36 |
| 4 | 176 | 15576 | 15756 |
| — | — | — | — |
| 9 | 127 | 8128 | 8264 |
| — | — | — | — |
| 113 | 5 | 15 | 133 |
| 114 | 6 | 21 | 141 |
| Total | 3491 | 146842 | 156066 (19×8214) |

## Superhuman Numerical Combinations

Let us write down the number of each verse in the Quran, preceded for each sura by the number of verses in that sura. Thus, Sura 1, which consists of seven verses, will be represented by the number 7 1234567. What we are doing here is forming long numbers by writing the numbers of verses next to each other. To find the number representing Sura 2, you write down the number of verses in this sura, 286, followed by the number of every verse, written next to each other. Thus, the number representing Sura 2 will look like this: 286 12345.....284285286. The two numbers representing the first two suras are:

```
7 1 2 3 4 5 6 7   &   286 1 2 3 4 5 ..... 284 285 286
```

Putting these two numbers together to form one number representing the first two suras, we get this number:

```
7 1 2 3 4 5 6 7 286 1 2 3 4 5 ..... 284 285 286
```

This process is continued until every verse in the Quran is written down, thus forming one very long number encompassing the number of every verse in the Quran. The number representing the whole Quran is a multiple of 19 & consists of 12692 digits, which is also a multiple of 19.

> First No.: This very long number consists of 12692 digits (19×668) and includes every verse in the Quran. The number of verses in each sura precedes its verses. A special computer program that divides very long numbers has shown that this long number is a multiple of 19.

Instead of putting the total number of verses in every sura ahead of the sura, let us put it at the end of every sura. Since we are putting the total number of verses per sura at the end of each sura, we must put the total number of numbered verses (6234) at the end of the Quran. Putting together all the verses of all the suras, produces a long number that consists of 12696 digits, and is a multiple of 19.

```
1234567 7 12345...286 286 12345 5...123456 6 6234
```

> Second No.: The number of every verse in every sura is followed by the number of verses per sura. The last 11 digits shown here are the 6 verses of the last sura, followed by its number of verses (6), followed by the number of numbered verses in the Quran (6234). The complete, very long number, is a multiple of 19.

Now let us include the number of every sura. Write down the number of every verse in every sura, followed by the number of the sura, followed by the number of verses in the sura. The total number of numbered verses (6234) is added at the end. This number, representing the whole Quran, is a multiple of 19.

```
1234567 1 7 12345...286 2 286 ...123456 114 6 6234
```

> Third No.: The number of every verse, followed by the sura number, then the number of verses in the sura. The total number of numbered verses is added at the end. The long number (12930 digits) is a multiple of 19.

Instead of putting the total number of verses in every sura after the sura, let us now put it ahead of the sura. This very long number representing the whole Quran is a multiple of 19.

```
7 1234567 1 286 12345...286 2...6 123456 114 6234
```

> Fourth No.: The total number of verses in each sura is followed by the number of every verse, then the sura number. The last 14 digits shown above are the number of verses in the last sura (6), followed by the numbers of the six verses (123456), followed by the number of the sura (114), then the total number of numbered verses in the Quran. The very long number (consisting of 12930 digits) is a multiple of 19.

Now, let us write down the number of every verse in every sura, followed by the sum of verse numbers for every sura. Sura 1 consists of 7 verses, and the sum of verse numbers is 1+2+3+4+5+6+7 = 28. The complete number, representing the whole Quran, consists of 12836 digits and is a multiple of 19.

```
1234567 28 12345...284285286 41041...123456 21
```

> Fifth No.: The number of every verse in every sura is followed by the sum of verse numbers. The long number consists of 12836 digits, and is a multiple of 19.

Remarkably, if we take the “Fifth No.” shown above and reverse the order of verse numbers and sum of verse numbers, i.e., move the sum of verse numbers, and put it ahead of the sura, the resulting long number is still a multiple of 19.

```
28 1234567 41041 12345....285286.....21 123456
```

> Sixth No.: Placing the sum of verse numbers ahead of each sura, instead of after it, produces a long number (12836 digits) that is also a multiple of 19.

Even writing the suras backward, i.e., reversing the order of suras by starting with the last sura and ending with the first sura, and placing the sum of verse numbers after the verses of each sura, the product is still a multiple of 19.

```
123456 21 12345 15..12345..286 41041 1234567 28
```

> Seventh No.: Reversing the order of suras — starting from the last sura and ending with the first sura — and writing down the number of every verse, with the sum of verse numbers for every sura after its verses, the product is a long number consisting of 12836 digits. This long number is a multiple of 19.

Write the sum of verse numbers for the whole Quran (333410), followed by the number of numbered verses in the Quran (6234), then the number of suras (114). Every sura is then represented by its number followed by its number of verses. The complete number, covering all suras of the Quran, consists of 474 digits, and is a multiple of 19.

```
333410 6234 114 1 7 2 286 3 200..113 5 114 6
```

> Eighth No.: The Grand Sum of verse numbers (333410) is followed by the number of numbered verses (6234), the number of suras (114), then the sura numbers and numbers of verses of every sura.

Now let us reverse the order of sura number and its number of verses as presented in the “Eighth No.” The complete number also consists of 474 digits and is still a multiple of 19.

```
333410 6234 114 7 1 286 2 200 3...5 113 6 114
```

> Ninth No.: Reversing the sequence of sura number and number of verses still gives us a long number that is a multiple of 19.

If we write down the sum of verse numbers for Sura 1 (28), followed by the sum of verse numbers for Sura 2 (41041), and so on to the end of the Quran, and placing the Grand Sum of verse numbers (333410) at the end, the resulting long number (Tenth No.) consists of 377 digits, and is a multiple of 19.

```
28 41041 20100 ..... 15 21 333410
```

> Tenth No.: The sums of verse numbers for every sura in the Quran, are written next to each other, followed at the end by the Grand Sum of verse numbers (333410). This long number (377 digits) is a multiple of 19.

If we write down the number of suras in the Quran (114), followed by the total number of numbered verses (6234), followed by the number of every sura and its sum of verse numbers, the final long number (612 digits) is a multiple of 19.

```
114 6234 1 28 2 41041 3 20100...113 15 114 21
```

> Eleventh No.: The number of suras, followed by the number of numbered verses, then the number of every sura and its sum of verse numbers, produce this long number (612 digits) that is a multiple of 19.

Lest anyone may think that any Quranic parameter is left un-guarded with this awesome mathematical code, let us look at more parameters. If we write down the number of suras (114), followed by the number of numbered verses, followed by the Grand Sum of verse numbers in the whole Quran (333410), followed by the numbers of every sura and its verses, we end up with a very long number (12712 digits) that is a multiple of 19.

```
114 6234 333410 1 1 2 3 4 5 6 7...114 1 2 3 4 5 6
```

> Twelfth Number.

If we write down the numbers of verses in every sura next to each other, we end up with a 235-digit number that is a multiple of 19. To do this, write down the total number of numbered verses in the Quran (6234), followed by the number of verses in every sura, then close with the total number of numbered verses in the Quran.

```
6234 | 7 286 200 176 | .... | 127 | .... | 5 4 5 6 | 6234
```

> Thirteenth Number. If we write down the number of numbered verses in the Quran (6234), followed by the number of suras (114), followed by the number of every verse in every sura, then close with the number of verses in the Quran (6234) and the number of suras (114), the final number consists of 12479 digits, and is a multiple of 19.

```
6234 114 1234567 12345...286...123456 6234 114
```

> Fourteenth Number. Another long number that consists of 12774 digits is formed by writing down the number of every verse in every sura, followed by the number of every sura added to its number of verses. Sura 1 consists of 7 verses, and the total 1+7 is 8. Since Sura 2 consists of 286 verses, the number representing Sura 2 looks like this: 12345...286 288. This is done for every sura in the Quran. The final combined number is a multiple of 19.

```
1234567 8 12345 ... 286 288 ........... 123456 120
```

> Fifteenth Number. More specialized features are in Appendices 2, 9, 19, 24, 25, 26, 29, and 37.

## Last Minute Discovery

[May 26, 1989 — Add to Appendix 1]

Mr. Abdullah Arik made the following discoveries just before printing time:

1. If we write down the number of verses in every sura, followed by the sum of verse numbers, and keep all number justified to the left, the total of all left-justified numbers is 4,859,309,774, or 19×255753146 (Table 1).
2. Do the same as above, except write down the number of every verse, instead of the number of verses. The total this time consists of 757 digits and is still a multiple of 19 (Table 2).
3. Do the same as above, but justify everything to the right, and write down the sura number, followed by the number of verses in that sura, followed by the number of every verse in the sura, and finally, the sum of verse numbers. The total consists of 759 digits and is also a multiple of 19 (Table 3).

> God Be Glorified.

**Table 1**

| Sura | Number |
| --- | --- |
| Sura 1 | 728 |
| Sura 2 | 28641041 |
| — | — |
| Sura 114 | 621 |
| Total | 4859309774 = 19 × 255753146 |

**Table 2**

| Sura | Number |
| --- | --- |
| Sura 1 | 123456728 |
| Sura 2 | 1234...28641041 |
| — | — |
| Sura 114 | 12345621 |

**Table 3**

| Sura | Number |
| --- | --- |
| Sura 1 | 17123456728 |
| Sura 2 | 2286123 ... 28641041 |
| — | — |
| Sura 114 | 114612345621 |

## A Witness From the Children of Israel [46:10]

> Proclaim: “What if it is from God, and you disbelieved in it? A witness from the Children of Israel has borne witness to a similar phenomenon, and he has believed, while you have turned too arrogant to believe. God does not guide the wicked.” [46:10]

The following quotation is taken from STUDIES IN JEWISH MYSTICISM (Association for Jewish Studies, Cambridge, Mass., Joseph Dan & Frank Talmage, eds., Page 88, 1982). The quotation refers to the work of Rabbi Judah the Pious (12th Century AD):

> The people [Jews] in France made it a custom to add [in the morning prayer] the words: “ ‘Ashrei temimei derekh [blessed are those who walk the righteous way],” and our Rabbi, the Pious, of blessed memory, wrote that they were completely and utterly wrong. It is all gross falsehood, because there are only nineteen times that the Holy Name is mentioned [in that portion of the morning prayer]... and similarly you find the word ‘Elohim nineteen times in the pericope of Ve-‘elleh shemot. . . . Similarly, you find that Israel were called “sons” nineteen times, and there are many other examples. All these sets of nineteen are intricately intertwined, and they contain many secrets and esoteric meanings, which are contained in more than eight large volumes. . . Furthermore, in this section there are 152 (19×8) words. ...

## Acknowledgments

All praise and thanks are due to God who has willed that His miracle of the Quran shall be revealed at this time. He has distinguished the following individuals and blessed them by revealing through them many portions of this momentous discovery: Abdullah Arik, Mohamoud Ali Abib, Lisa Spray, Edip Yuksel, Ihsan Ramadan, Feroz Karmally, Ismail Barakat, Gatut Adisoma, Ahmed Yusuf (of Lagos), Cesar A. Majul, Muhtesem Erisen, Emily Kay Sterrett and Cecilia Albertha Wallen.

> United Submitters International / International Community of Submitters / Masjid Tucson
$md$, NULL, NULL),

-- Appendix 2: God's Messenger of the Covenant
('2', $md$> “God took a covenant from the prophets, saying, ‘After I have given you the scripture and wisdom, a messenger will come to confirm what you have. You shall believe in him and support him.’ He said, ‘Do you agree with this, and pledge to uphold this covenant?’ They said, ‘We agree.’ He said, ‘You have thus borne witness, and I am with you a witness.’”
>
> [3:81]

God's Messenger of the Covenant is a consolidating messenger. His mission is to purify and unify all existing religions into one: Submission (Islam). Islam is NOT a name; it is a description of one's total submission and devotion to God ALONE, without idolizing Jesus, Mary, Muhammad, or the saints. Anyone meeting this criterion qualifies as a “Muslim” (Submitter) — Muslim Jews, Muslim Christians, and so on.

The Quran is clear that the only religion approved by God is Submission ([3:19]), and that anyone who seeks other than Submission as a religion, it will not be accepted ([3:85]).

All previous messengers required divine proof of their messengership: Moses transformed his staff into a serpent, Jesus healed lepers and revived the dead, Saleh produced the famous camel, Abraham walked out of fire, and Muhammad's proof was the Quran itself ([29:50-51]). A new messenger likewise requires divine, incontrovertible proof.

## A Quranic Truth

[33:7]: “And when we exacted a covenant from the Prophets, and from thee (O Muhammad) and from Noah and Abraham and Moses and Jesus son of Mary, We took from them a solemn covenant.”

## Prophet vs. Messenger

The Quran makes a critical distinction between *Nabi* (Prophet) and *Rasoul* (Messenger). A prophet delivers a new scripture, while a messenger confirms existing scripture without bringing new revelation. Every prophet is also a messenger, but not every messenger is a prophet.

Not every messenger received a new scripture. Some assume Aaron was a prophet ([19:53]) who was given no scripture, yet the Quran states the Torah was given “to both Moses and Aaron” ([21:48], [37:117]). It has also always been a human trait to reject a living messenger: Joseph was even declared “the last messenger” ([40:34]), though Moses, David, Solomon, Jesus, and Muhammad all came after him.

[33:40] states: “Muhammad was not the father of any of your men; he was a messenger (Rasoul) of God and the last prophet (Nabi).” Muhammad was thus the last prophet — no new scripture after him — but messengers can and do come after him. The gematrical value of “Muhammad Khaatum Al-Nabiyyeen” (the last prophet), plus the sura number (33) and the verse number (40), equals 1349, or 19×71. By contrast, the value of the erroneous expression “Muhammad Khaatum Al-Mursaleen” (the last messenger) is not a multiple of 19 — confirming the distinction through the Quran's mathematical code.

## The Prophecy

References to a consolidating messenger appear throughout the Quran at [3:81], [33:7], and [33:40]. This prophecy is also found in the Bible at Malachi 3:1–3: “Lo, I am sending my messenger to prepare the way before me; and suddenly there will come to the temple the Lord whom you seek and the messenger of the covenant whom you desire.”

The covenant was confirmed in a personal experience during the Hajj pilgrimage on Zul-Hijjah 3, 1391 (December 21, 1971): “I was sitting still, while the prophets, one by one, came towards me, looked at my face, then nodded their heads.” Notably, the numerical sum of month (12) + day (3) + year (1391) = 1406 = 19×74. The number 19 is mentioned in Sura 74. The number 1406 is also the count of years from the revelation of the Quran to the revelation of its miracle ([Appendix 1](/appendices/1)).

## The Proof

The name of God's Messenger of the Covenant is mathematically coded into the Quran as “Rashad Khalifa” — the most appropriate way to introduce God's messenger to the world in the computer age. The following is physical, examinable, verifiable, and irrefutable evidence.

> - • **(1)** The Quran's 19-based miracle remained hidden for 1406 years (19×74), predestined to be unveiled through Rashad Khalifa. For fourteen centuries, hundreds of Muslim and Orientalist scholars tried in vain to decipher the Quranic Initials.
> - • **(2)** The Quran is made easy only for sincere believers ([54:17], [39:28]). No one is granted access to the Quran — let alone its miracle — without specific divine authorization ([17:45-46], [18:57], [41:44], [56:79]). Its unveiling through Rashad Khalifa is a major sign of his messengership.

Table 1: Suras and Verses of “Rashada” and “Khalifa”

| \# | Sura | Verse |
| --- | --- | --- |
| 1 | 2 | 186 |
| 2 | — | 256 |
| 3 | 4 | 6 |
| 4 | 7 | 146 |
| 5 | 11 | 78 |
| 6 | — | 87 |
| 7 | — | 97 |
| 8 | 18 | 10 |
| 9 | — | 17 |
| 10 | — | 24 |
| 11 | — | 66 |
| 12 | 21 | 51 |
| 13 | 40 | 29 |
| 14 | — | 38 |
| 15 | 49 | 7 |
| 16 | 72 | 2 |
| 17 | — | 10 |
| 18 | — | 14 |
| 19 | — | 21 |
| Totals | 224 | 1145 |

Repeated sura numbers are shown as “—” and counted once: the nine distinct suras sum to 224, and the nineteen verse numbers sum to 1145.

“Khalifa” occurs at 2:30 (a non-human khalifa — Satan) and 38:26 (a human khalifa). Sura 2 is already counted above, so “Khalifa” adds sura 38 and verses 30 + 26 = 56. Grand total: 224 + 1145 + 38 + 56 = 1463 = 19×77.

> Numbered Mathematical Proofs
>
> - • **(3)** The root word “Rashada” (to uphold the right guidance) occurs in the Quran exactly 19 times — the Quran's common denominator.
> - • **(4)** “Rashad” occurs at 40:29 and 40:38. “Khalifa” occurs at 2:30 (a non-human khalifa — Satan) and 38:26 (a human khalifa). Adding the suras and verses of “Rashad” (40:29, 38) and the human “Khalifa” (38:26): 40+29+38+38+26 = 171 = 19×9.
> - • **(5)** The sum of all sura and verse numbers where “Rashada” and “Khalifa” occur, combined = 1463 = 19×77.
> - • **(6)** “Rashada” total = 1369 = (19×72) + 1; “Khalifa” total = 94 = (19×5) − 1. “Rashada” up by one and “Khalifa” down by one pins the name to “Rashad Khalifa” — not any other Rashad or Khalifa.
> - • **(7)** Gematrical value of “Rashad” = 505; “Khalifa” = 725 (combined 1230). From the beginning of the Quran to the first “Rashada” (2:186): 3 suras, 192 verses. 505 + 725 + 3 + 192 = 1425 = 19×75.
> - • **(8)** The sum of all verse numbers from 1:1 through 2:186 (first “Rashada”) = 17,233 = 19×907.
> - • **(9)** The Quranic Initials appear in 29 suras; the sum of those sura numbers = 822. 822 + 1230 (Rashad Khalifa) = 2052 = 19×108.
> - • **(10)** The sura numbers plus their verse counts for all suras containing “Rashada” = 1368 = 19×72.
> - • **(11)** Writing each sura number, followed by its number of verses, followed by the individual verse numbers, from the first “Rashada” (2:186) to the last (72:21), produces a single number of 11,087 digits that is divisible by 19.
> - • **(12)** From the first “Rashada” to the word “Khalifa” in 38:26, the sum of the sura numbers and their verse counts = 4541 = 19×239.
> - • **(13)** Writing the value of “Rashad” (505), then “Khalifa” (725), then every sura and verse number where “Rashada” occurs from 2:186 to “Khalifa” (38:26), produces a number divisible by 19.

**(14)** The Quran specifies three messengers of Submission (Islam): Abraham, who delivered all the practices of Islam (gematrical value 258); Muhammad, who delivered the Quran (92); and Rashad, who delivered Islam's proof of authenticity (505). Total: 258 + 92 + 505 = 855 = 19×45.

The true Judaism, Christianity, and Islam will be consolidated into one religion — complete submission and absolute devotion to God ALONE. The existing religions are severely corrupted and will die out ([9:33], [48:28], [61:9]).

**(15)** Since the Quran sometimes refers to “Abraham, Ismail, and Isaac,” the gematrical values of all five messengers were added — and the total remains a multiple of 19:

Gematrical Values of the Five Messengers

| Name | Letter Values | Total |
| --- | --- | --- |
| Abraham | 1+2+200+5+10+40 | 258 |
| Ismail | 1+60+40+70+10+30 | 211 |
| Isaac | 1+60+8+100 | 169 |
| Muhammad | 40+8+40+4 | 92 |
| Rashad | 200+300+1+4 | 505 |
| Total | 1235 = 19×65 |   |

This divisibility by 19 is not possible if any of the three names Abraham, Muhammad, or Rashad is omitted.

**Verse 3:81** carries profound mathematical confirmation:

> - • **(16)** 505 (Rashad) + 725 (Khalifa) + 81 (verse number) = 1311 = 19×69.
> - • **(17)** Sura 81, verse 19 mentions a messenger “powerfully supported and authorized.”
> - • **(18)** From 1:1 to 3:81: Sura 1 (7 verses) + Sura 2 (286 verses) + Sura 3 (81 verses) = 374 verses. 1+2+3+7+286+81 = 380 = 19×20.
> - • **(19)** The gematrical value of the entire verse 3:81 = 13,148 = 19×692.
> - • **(20)** The key phrase “JAA'AKUM RASOOLUN MUSADDIQUN LEMAA MA'AKUM” (a messenger will come to confirm what you have) = 836 = 19×44.

> “Surely, you are one of the messengers.”
>
> [36:3]

**(21)** Among the initialed suras, Sura 36 (Ya Seen) occupies position number 19. The identity of the messenger in 36:3 was revealed through the angel Gabriel.

**(22)** The gematrical value of verse 36:3 is 612. Calculation: 36 + 3 + 612 + 505 + 725 = 1881 = 19×99.

**(23)** Sura 36 has 83 verses: 36 + 83 + 505 + 725 = 1349 = 19×71.

**(24)** From 3:81 to Sura 36 there are 3330 verses. 505 + 725 + 3330 = 4560 = 19×240.

**(25)** From 3:81 to 36:3 there are exactly 3333 verses. 3333 + 505 = 3838 = 19×202.

**(26)** From 1:1 to 36:3 there are 3705 verses = 19×195.

**(27)** The sum of all verse numbers from 1:1 to 36:3 = 257,925 = 19×13,575.

**(28)** The sum of sura numbers 1 through 36 = 666. Calculation: 666 + 505 + 725 + 612 = 2508 = 19×132.

**(29–30)** From the first “Rashada” (2:186) to 36:3, the sum of sura numbers = 665 = 19×35, representing 35 suras. The full sum of sura totals + verse numbers = 241,395 = 19×12,705.

## A Messenger to the People of the Scripture

> “O people of the scripture, our messenger has come to you, to clarify things for you, after a long period without messengers. Lest you say, ‘No preacher or warner has come to us.’ A preacher and warner has come to you. God is Omnipotent.”
>
> [5:19]

**(31)** The verse number is 19 — the Quran's common denominator and the number of “Rashada” occurrences.

**(32)** 1230 (Rashad Khalifa) + 5 (sura) + 19 (verse) = 1254 = 19×66.

**(33)** From the beginning of the Quran through 5:19: Sura 1 (7 verses) + Sura 2 (286) + Sura 3 (200) + Sura 4 (176) + Sura 5 (19) = 688 verses total; 1+2+3+4+5+7+286+200+176+19 = 703 = 19×37.

## The Proof (Sura 98)

[98:1-2]: “Those who disbelieved among the people of the scripture, and the idolators, will not believe, despite the profound sign given to them. A messenger from God, reciting Sacred Scriptures.”

**(34)** 505 (Rashad) + 725 (Khalifa) + 98 (sura) + 2 (verse) = 1330 = 19×70.

**(35)** The word “Bayyinah” (profound sign), the title of Sura 98, occurs in the Quran exactly 19 times — confirming that the Quran's proof is based on 19.

## A Profound Messenger Has Come

**(36)** From 1:1 to 44:13: the sum of sura numbers = 990, verse numbers = 4425. Combined: 5415 = 19×19×15.

**(37)** Sura number (44) + verse number (13) = 57 = 19×3.

## End of the World

God alone knows the end of the world ([7:187], [31:34], [33:63], [41:47], [43:85]), yet He chooses to reveal certain knowledge to messengers He selects ([72:27]).

**(38–39)** Total verses from the beginning of the Quran to 72:27 = 5472 = 19×72×4. Sura 72 contains four occurrences of “Rashada” at verses 2, 10, 14, and 21. The sum 1230+72+2+10+14+21 = 1349 = 19×71.

**(40)** The opening phrase of [72:27], “Only the Messenger that He chooses,” has a gematrical value of 1919.

## Mercy from God

When the believers are faced with a problem, they develop a number of possible solutions, and this invariably leads to considerable bickering, disunity, and disarray. It is but mercy from God that He sends to us messengers to provide the final solutions to our problems ([2:151], [3:164], [21:107]).

God sends His messengers to communicate with us, and to disseminate new information ([42:51]). We are enjoined to accept, without the slightest hesitation, the teachings delivered to us through God's messengers ([4:65], [4:80]).

## Criteria for God's Messenger

Three minimum criteria identify God's Messenger of the Covenant:

1. God's messenger advocates the worship of God ALONE, and the abolition of all forms of idol worship.
2. God's messenger never asks for a wage for himself.
3. God's messenger is given divine, incontrovertible proof of his messengership.

The most important difference between God's messenger and a fake messenger is that God's messenger is supported by God, while the fake messenger is not. God's messenger is supported by God's invisible soldiers ([3:124-126], [9:26], [9:40], [33:9], [37:171-173], [48:4], [48:7], [74:31]), by God's treasury ([63:7-8]), and is guaranteed victory and dignity, in this world and forever ([40:51], [58:21]).

Thus, the truthfulness of God's messenger invariably prevails, while the falsehood of a fake messenger invariably, sooner or later, is exposed.

## Principal Duties

The principal duties of God's Messenger of the Covenant include:

1. Unveil the Quran's mathematical miracle ([Appendix 1](/appendices/1)).
2. Remove the false verses 9:128–129 ([Appendix 24](/appendices/24)).
3. Explain the purpose of our life ([Appendix 7](/appendices/7)).
4. Proclaim one religion and purge corruptions from Judaism, Christianity, and Islam ([Appendix 13](/appendices/13), [15](/appendices/15), [19](/appendices/19)).
5. Proclaim Zakat as a prerequisite for redemption ([7:156]) and explain its correct practice ([Appendix 15](/appendices/15)).
6. Unveil the end of the world ([Appendix 25](/appendices/25)).
7. Proclaim that those who die before the age of 40 are destined for Heaven ([Appendix 32](/appendices/32)).
8. Explain the death of Jesus ([Appendix 22](/appendices/22)).
9. Explain the delivery of the Quran through Muhammad ([Appendix 28](/appendices/28)).
10. Announce that Muhammad wrote the Quran with his own hand ([Appendix 28](/appendices/28)).
11. Explain why most believers do not reach Heaven ([Appendix 27](/appendices/27)).
12. Proclaim that God never ordered Abraham to kill his son ([Appendix 9](/appendices/9)).
13. Proclaim the secret of perfect happiness (Introduction).
14. Establish the Quran's criminal justice system ([Appendix 37](/appendices/37)).
$md$, NULL, NULL),

-- Appendix 3: We Made the Quran Easy
('3', $md$> “We made the Quran easy to learn. Does anyone wish to learn?”
>
> [54:17] · also [54:22] · [54:32] · [54:40]

Verse [11:1] informs us that the Quran’s Miracle involves [1] the superhuman mathematical design of its physical structure and [2] the simultaneous composition of a literary work of extraordinary excellence.

One may be able to meet the numerical distribution requirements of a simple mathematical pattern. However, this is invariably accomplished at the expense of the literary quality. The simultaneous control of the literary style and the intricate mathematical distribution of individual letters throughout the Quran (Appendix 1) is evident in the fact that the Quran is made easy to memorize, understand, and enjoy. Unlike a human-made book, the Quran is enjoyable to read over and over, infinitely.

The title of this Appendix is repeated in Sura 54, verses 17, 22, 32, and 40. As it turns out, the Quran’s Arabic text is composed in such a way as to remind the reader or the memorizer of the next correct expression, or the next verse. God created us and He knows the most efficient way for fixing literary materials into our memory. Memorization of the Quran has played a vital role in preserving the original text generation after generation at a time when written books were a rarity.

Without even realizing it, the person who memorizes the Quran is divinely helped by an intricate literary system as he utters the sounds of the Quranic words. Almost every verse in the Quran contains what I call “Memory Bells.” Their function is to remind the reader of what comes next. This system is so vast, I will give only two illustrative examples:

## Memory Bells

> Example 1
>
> In Sura 2, Verses 127, 128, and 129 end with two different names of God each. These pairs of names are “Al-Samee‘ Al-‘Aleem (The Hearer, the Omniscient),” “Al-Tawwaab Al-Raheem (The Redeemer, Most Merciful)”, and “Al-‘Azeez Al-Hakeem (The Almighty, Most Wise),” respectively. If this were a regular book, one would easily mis-match these six names. Not so in the Quran. Each one of these pairs is preceded in the same verse by a “Memory Bell” that reminds us of the correct pair of names. Thus, Verse 127 talks about Abraham and Ismail raising the foundations of the Ka‘abah. The verse ends with the names “Al-Samee‘ Al-‘Aleem.” The prominent sounds here are the “S,” “M,” and “ ‘Ayn.” These three letters are prominent in the word “Ismail.” We find that this word is conspicuously delayed in the sentence, while improving its literary quality. Thus, we find that the verse goes like this: “When Abraham raised the foundations of the Ka‘abah, together with Ismail ...” Normally, a human writer would say, “When Abraham and Ismail raised the foundations of the Ka‘abah....” But delaying the sounds in “Ismail” brings them closer to the end of the verse, and thus reminds us that the correct names of God in this verse are “Al-Samee‘ Al-‘Aleem.”
>
> Verse 128 has the prominent word “Tubb” just before the names “Al-Tawwaab Al-Raheem.” The word “Tubb” thus serves as the memory bell. The names of God at the end of [2:129] are “Azeez, Hakeem.” The prominent sounds here are “Z” and “K.” Obviously, the memory bell in this verse is the word “Yuzakkeehim.”

> Example 2
>
> Another good example is found in [3:176], [3:177], & [3:178], where the retribution for disbelievers is described as “ ‘Azeem (Terrible),” “Aleem (Painful),” and “Muheen (Humiliating),” respectively. In a human-made book, the memorizer could easily mix up these three descriptions. But we find that each of these adjectives is preceded by powerful memory bells that prevent such a mix-up. The word “ ‘Azeem” of Verse 176 is preceded by the word “Huzzun,” which is characterized by a stressed letter “Z.” This serves to remind us of the particular adjective at the end of this verse. The word “Aleem” of Verse 177 is preceded by the sound of the word “Iman” to serve as a memory bell, and the word “Muheen” of 3:178 is preceded by an abundance of “M” and “H” throughout this verse.

Other examples of memory bells include the ending of [3:173] and the beginning of [3:174], the ending of [4:52] and the beginning of [4:53], the ending of [4:61] and the beginning of [4:62], the ending of [18:53] and the beginning of [18:54], and many more.

United Submitters International / International Community of Submitters / Masjid Tucson
$md$, 'PwY2nPtuNVE', 'Appendix 3 — We Made the Quran Easy'),

-- Appendix 4: Why Was the Quran Revealed in Arabic?
('4', $md$> “If we revealed this to people who do not know Arabic. And had him recite it (in Arabic), they could not possibly believe in it.”
>
> [26:198-199]

We learn from [41:44] that the sincere believers have access to the Quran, regardless of their mother tongue. The disbelievers, on the other hand, are not permitted access to the Quran, even if they are professors of the Arabic language ([17:45], [18:57], [41:44], [56:79]).

Arabic is the most efficient language in the world, especially when it comes to the precise statement of laws. Since the Quran is a Statute Book, it was crucial that such laws be clearly stated. God chose Arabic for His Final Testament because it is the most suitable language for that purpose.

## The Efficiency of Arabic

Arabic is unique in its efficiency and accuracy. For example, the word “they” in English does not tell you if “they” are males or females. Arabic has four distinct forms:

> Pronouns for “They” in Arabic
>
> - HUM — they (males)
> - HUNNA — they (females)
> - HUMAA — they (two males)
> - HAATAAN — they (two females)
>
> This feature does not exist in any other language in the world.

This precision was extremely helpful in stating laws such as in [2:228], which enjoins the divorcee to give up her own wishes to divorce her husband if she discovers she is pregnant and the husband wishes to reconcile — the welfare of the child takes priority. The efficiency of the Arabic language made it possible to state this law clearly in very few words, specifying exactly whose wishes are to be superseded. Any other language would have made this almost impossible to convey with such brevity.

Another example is the word *Qaalataa* of [28:23], which translates into four English words: “the two women said.” Such is the efficiency of Arabic.

## Gender and the Reference to God

Another reason for choosing Arabic is that “He” and “She” in Arabic do not necessarily imply natural gender. Thus, when God is referred to as “He,” this does not imply gender at all. God be glorified; He is neither male nor female. The usage of “He” to refer to God in English, for example, has contributed to a false image of God — compounded further by distorted expressions such as “Father” when referring to God. Such a reference to God is never found in the Quran.
$md$, 'BkZJa7j0z2M', 'Appendix 4 — Why Was the Quran Revealed in Arabic?'),

-- Appendix 5: Heaven and Hell
('5', $md$> “Whoever succeeds in barely missing Hell, and is admitted into Heaven, has attained a great triumph.”
>
> [3:185]

The descriptions of Heaven and Hell throughout the Quran are allegorical. And the Quran tells us so whenever such descriptions occur as independent statements, not within a general subject. See [2:24-26], [13:35], and [47:15]. The word *Mathal* (allegory) is used in these verses. Linguistically, the word “Mathal” in these verses can be removed, and we still have perfect sentences. But it is there because the descriptions of Heaven and Hell are allegorical.

What Heaven and Hell are really like is far beyond our comprehension. Hence the need for allegory.

How can one describe, for example, the taste of chocolate to a person who never tasted chocolate? Allegory will have to be used. The person has to wait to actually taste chocolate in order to know what chocolate tastes like. Whatever allegory we use to describe the taste of chocolate can never approximate the real thing.

## Heaven and Hell

Heaven already exists, since Adam and Eve were placed in it during their days of innocence ([2:35]). We learn from Sura 55 that there are two “High Heavens” - one for the humans and one for the jinns - and two “Lower Heavens” - one for the humans and one for the jinns (see [Appendix 11](/appendices/11) for more details).

Hell is not created yet. It will be created on the Day of Judgment ([69:17] & [89:23]). More details are given in [Appendix 11](/appendices/11).

## The High Heaven vs The Lower Heaven

There are profound differences between the High Heaven and the Lower Heaven.

> WaterAllegorically, water in the High Heaven flows freely ([55:50]), while the water of the Lower Heaven needs to be pumped out ([55:66]).
>
> FruitAllegorically, the High Heaven has all kinds of fruit ([55:52]), while the Lower Heaven has a limited variety of fruits ([55:68]).
>
> SpousesAllegorically, the pure spouses readily join their spouses in the High Heaven ([55:56]), while the dwellers of the Lower Heaven must go fetch their spouses ([55:72]).

Yet, even the Lower Heaven is an incredibly fantastic prize for those who are fortunate enough to escape Hell and end up in the Lower Heaven ([3:185]) - going to the Lower Heaven is a great triumph. People who depart this life before reaching their 40th birthday, and did not sufficiently develop their souls, will go to the Lower Heaven ([46:15], [Appendices 11](/appendices/11) & [32](/appendices/32)). The High Heaven is reserved for those who believed, led a righteous life, and developed their souls sufficiently.

United Submitters International / International Community of Submitters / Masjid Tucson
$md$, 'DCw1FX2sidE', 'Appendix 5 — Heaven and Hell'),

-- Appendix 6: Greatness of God
('6', $md$> “They can never fathom the greatness of God. The whole earth is within His fist on the Day of Resurrection. In fact, the universes are folded within His right hand. Be He glorified; He is much too high above needing any partners.”
>
> [39:67]

We learn from [39:67] that God's greatness is far beyond human comprehension — the verse states that all seven universes are “folded within God's hand.”

Supported by the Quran's formidable mathematical code, we are taught that our universe is the smallest and innermost of seven universes ([41:12], [55:33], [67:5], & [72:8-12]). Meanwhile, our scientific advances have shown us that our galaxy, the Milky Way, is 100,000 light years across, and that our universe contains a billion such galaxies and a billion trillion stars, plus countless decillions of heavenly bodies. Our universe is estimated to span distances in excess of 20,000,000,000 light years.

## Count the Stars

> A Thought Experiment
>
> If we take only a quintillion [1,000,000,000,000,000,000] of the stars and simply count them — one count per second, day and night — this will take 32 billion years (more than the age of the universe). That is how long it would take to just *count* them. God *created* them. Such is the greatness of God.

## A Space Odyssey

We can appreciate the vastness of our universe by imagining a journey at the speed of light. Leaving Earth toward the sun, we travel 93,000,000 miles and arrive in 8 minutes. To exit our galaxy would take more than 50,000 years at the speed of light. From the outer limit of the Milky Way, our planet Earth is invisible — not even the most powerful telescope can detect it.

To reach our nearest neighboring galaxy would require more than 2,000,000 years at the speed of light. To reach the outer limit of our universe: at least 10,000,000,000 years. From that outer limit, even the Milky Way is like a speck of dust in a large room.

The second universe surrounds our universe. The third universe is larger than the second, and so on. More accurately, our universe should be considered the seventh universe, surrounded by the sixth, which is surrounded by the fifth, and so on. Can you imagine the vastness of the first, outermost universe? No number exists to describe its circumference. This incomprehensible vastness is “within the fist of God's hand.”

From the outer limit of the outermost universe, where is the planet Earth? How significant is it? On this infinitesimal mote, such minuscule creatures as Mary, Jesus, and Muhammad lived. Yet some people set up these powerless humans as gods!

God's greatness is represented not only by the fact that He holds the seven universes in His hand, but also by the fact that He fully controls every atom — even subatomic components — everywhere in the greater universe ([6:59], [10:61], & [34:3]).
$md$, '64v6qoyK3cA', 'Appendix 6 — Greatness of God'),

-- Appendix 7: Why Were We Created?
('7', $md$> We are in this world because we committed a horrendous crime, and this life is our chance to redeem ourselves, denounce our crime, and rejoin God's kingdom.

It all began a few billion years ago when “a feud arose in the Heavenly Society” ([38:69]). One of the high-ranking creatures, Satan, entertained supercilious thoughts that his God-given powers qualified him to be a god besides God. He thus challenged God's absolute authority. Not only was Satan's idea blasphemous, it was wrong - only God, and no one else, possesses the qualifications and ability to be a god. Consequent to Satan's blasphemy, a division occurred in the Heavenly Society, and all constituents of God's kingdom became classified into four categories:

1. **Angels:** Creatures who upheld God's absolute authority.
2. **Animals:** Rebels (animals, trees, stars, etc.) who took advantage of God's offer to repent and re-enter His kingdom. [From Introduction.]
3. **Jinns:** Creatures who agreed with Satan; that he is capable of being a "god."
4. **Humans:** Creatures who did not make up their minds; they failed to make a firm stand with God's absolute authority.

## The Most Merciful

The angels expected God to banish the creatures who did not uphold His absolute authority ([2:30]). But God is Most Merciful; He decided to give us a chance to denounce our mistake, and informed the angels that He knew what they did not know ([2:30]). God knew that some creatures deserved a chance to be redeemed.

If you claim the ability to fly a plane, the best way to test your claim is to give you a plane and ask you to fly it. This is precisely what God decided to do in response to Satan's claim. God created seven vast universes, then informed the angels that He was appointing Satan as a god on the tiny mote called “Earth” ([2:30]). The Quranic accounts related to appointing Satan as a temporary “god” ([36:60]) confirm the previous scripture.

> Isaiah 14:13-15
>
> You, Lucifer, said in your heart: “I will scale the heavens. Above the stars of God. I will set up my throne. I will take my seat on the Mount of Congregation, in the recesses of the North. I will ascend above the tops of the clouds; I will be like the Most High!”
>
> Matthew 4:8-10 & Luke 4:5-8
>
> The devil then took Jesus up a very high mountain and displayed before him all the kingdoms of the world in their magnificence, promising: “All these will I bestow on you if you prostrate yourself in homage before me.” At this, Jesus said to him, “Away with you, Satan! Scripture has it: ‘You shall worship the Lord your God; Him ALONE shall you adore.’”

God's plan called for creating death ([67:1-2]), then bringing the humans and jinns into this world. Thus, they start over without any biases, and exercise full freedom to uphold God's absolute authority or Satan's polytheistic theory. To make this crucial decision, every human being receives a message from God advocating His absolute authority, as well as a message from Satan pushing his polytheistic principles.

To give us a headstart, the Most Merciful gathered all the human beings before Him, prior to sending us to this world, and we bore witness that He alone is our Lord and Master ([7:172]). Thus, upholding God's absolute authority is a natural instinct that is an integral part of every human being.

After putting the rebels to death, the souls of humans and jinns were placed in a special depository. God then created the appropriate bodies to house the souls of jinns and humans during the test period. The first jinn body was made from fire, and Satan was assigned to that body ([15:27]). The first human body was created from earthly material, clay ([15:26]), and God assigned the first human soul to that body. The divine plan called for the angels to serve the humans on earth - guard them, drive the wind and rain for them, distribute provisions, etc. This fact is stated in the Quran allegorically: “Your Lord said to the angels, ‘Fall prostrate before Adam.’” Satan of course refused to have anything to do with serving the human race ([2:34], [7:11], [17:61], [18:50], [20:116]).

While Adam's body remained on earth, the real person, the soul, was admitted into Heaven in the outermost universe. God gave Adam certain commandments, represented by the forbidden tree, and Satan was appointed as Adam's companion to deliver to Adam his satanic message. The rest is history.

Every time a human being is born, a human person is assigned to the new baby from the depository of souls. God assigns the souls in accordance with His knowledge ([28:68]). Every soul deserves to be assigned to a certain body, and live under certain circumstances. God alone knows which souls are good and which souls are evil. Our children are assigned to our homes in accordance with God's plan.

An independent jinn soul is also assigned to the new human being to represent Satan's point of view. While the physical body of any jinn is reproduced from the parent jinns, the jinn soul is that of an independent individual. Jinns are descendants of Satan ([7:27], [18:50]). The assigned jinn remains with the human being from birth to death, and serves as the main witness on the Day of Judgment ([50:23]). A continuous debate takes place in our heads between the human soul and the jinn soul until both of them are convinced of one point of view.

## The Original Sin

Contrary to common belief, the “Original Sin” was not Adam's violation of God's law when he ate from the forbidden tree. The original sin was our failure to uphold God's absolute authority during the Great Feud. If the human person convinces his or her jinn companion to denounce that original sin, and uphold God's absolute authority, both creatures are redeemed to God's eternal kingdom on the Day of Judgment. But if the jinn companion convinces the human being to uphold Satan's idolatrous views, then both creatures are exiled forever from God's kingdom.

To promote his point of view, Satan and his representatives advocate the idolization of such powerless creatures as Muhammad, Jesus, Mary, and the saints. Since we are here due to our polytheistic tendencies, most of us are easy prey for Satan.

Satan's incompetence as a “god” has already been proven by the prevalence of chaos, disease, accidents, misery, and war throughout his dominion ([36:66]). On the other hand, the human beings who denounce Satan, uphold God's absolute authority, and refrain from idolizing powerless and dead creatures like Jesus and Muhammad, are restored to God's protection - they enjoy a perfect life here in this world and forever.

Because our life in this world is a series of tests designed to expose our polytheistic ideas, idol worship is the only unforgivable offense ([4:48], [4:116]). The world is divinely designed to manifest our decision to uphold either God's absolute authority, or Satan's idolatrous views ([67:1-2]). The day and the night change constantly to test our willingness to uphold God's laws by observing the Dawn Prayer and fasting during the hottest and longest days. Only those who are totally certain about God's absolute authority are redeemed ([26:89]).

United Submitters International / International Community of Submitters / Masjid Tucson
$md$, 'LKrk3v00r80', 'Appendix 7 — Why Were We Created?'),

-- Appendix 8: The Myth of Intercession
('8', $md$> “Say, ‘All intercession belongs to God.’”
>
> [39:44]

To believe that anyone, other than God, can intercede on our behalf to have our sins forgiven or our wishes fulfilled, is to set up partners with God. This is idolatry. The Quran proclaims that “All intercession belongs to God” ([39:44]), and that there will be “no intercession on the Day of Judgment” ([2:254]).

The myth of intercession is one of Satan's most effective tricks to dupe millions of people into idol worship. Millions of Christians believe that Jesus will intercede for them at God, and millions of Muslims believe that Muhammad will intercede on their behalf. Consequently, these people idolize Jesus and Muhammad.

## The Illogical Concept

The concept of intercession is utterly illogical. Those who believe in Muhammad's intercession, for example, claim that he will ask God to forgive them and admit them into Paradise. They imagine Muhammad on the Day of Judgment choosing the candidates for his intercession. If you ask those who believe in intercession: “How will Muhammad recognize those who deserve his intercession?” they tell you, “God will tell him!”

> The Logical Absurdity
>
> According to this concept, a person will go to Muhammad and request his intercession. Muhammad will then ask God whether this person deserves his intercession or not. God will inform Muhammad that the person deserves to go to Paradise. Muhammad will then turn around and tell God that the person deserves to go to Paradise! The blasphemy is obvious; those who believe in intercession make God a secretary of their idol Muhammad. God be glorified.

## What the Quran Actually Says

Since the Quran is the most accurate book, it acknowledges that everyone in Paradise will intercede on behalf of his or her loved ones: “Please God, admit my mother into Paradise.” This intercession will work if the person's mother deserves to go to Paradise ([2:255], [20:109], [21:28]). Thus, intercession, though it will take place in this manner, is utterly useless.

We learn from the Quran that Abraham, God's beloved servant, could not intercede on behalf of his father ([9:114]). Noah could not intercede on behalf of his son ([11:46]). Muhammad could not intercede on behalf of his uncle ([111:1-3]) or relatives ([9:80]). What makes anyone think that a prophet or a saint will intercede on behalf of a perfect stranger?! See [2:48], [2:123], [6:51], [6:70], [6:94], [7:53], [10:3], [19:87], [26:100], [30:13], [32:4], [36:23], [39:44], [40:18], [43:86], [53:26] & [74:48]. Muhammad's intercession is in [25:30].
$md$, 'rsZV4eImXzI', 'Appendix 8 — The Myth of Intercession'),

-- Appendix 9: Abraham: Original Messenger of Submission
('9', $md$> “He has chosen you and has placed no hardship on you in practicing your religion - the religion of your father Abraham. He is the one who named you ‘Submitters’ originally.”
>
> [22:78]

One of the prevalent myths is that Muhammad was the founder of Islam. Although Islam, total submission to God alone, is the only religion recognized by God since the time of Adam ([3:19], [3:85]), Abraham is reported in the Quran as the first user of the word “Islam” and the one who called us “Muslims,” i.e., Submitters ([22:78]). Abraham's exemplary submission to God is demonstrated by his famous willingness to sacrifice his only son, Ismail, when he thought that that was God's command. As it turns out, such a command was in fact from Satan.

## God Never Ordered Abraham to Sacrifice His Son

God is the Most Merciful. He never violates His own law ([7:28]). Any person who believes that the Most Merciful ordered Abraham to kill his son cannot possibly make it to God's Heaven. Such evil thought about God is grossly blasphemous. Nowhere in the Quran do we see that God ordered Abraham to kill his son. On the contrary, God intervened to save Abraham and Ismail from Satan's plot ([37:107]), and He told Abraham: “You believed the dream” ([37:105]). Undoubtedly, it was a dream inspired by Satan. God's irrevocable law is: “God never advocates sin” ([7:28]).

## Millat Ibrahim

Islam is called “Millat Ibrahim” (The Religion of Abraham) throughout the Quran ([2:130], [2:135]; [3:95]; [4:125]; [6:161]; [12:37-38]; [16:123]; [21:73]; [22:78]). Moreover, the Quran informs us that Muhammad was a follower of Abraham ([16:123]).

Due to a general unawareness of the fact that Abraham was the original messenger of Islam (Submission), many so-called Muslims challenge God: “If the Quran is complete and fully detailed (as claimed by God), where can we find the number of Rak'ahs (units) in each contact prayer (Salat)?” We learn from the Quran that all religious practices of Islam were already established before the Quran's revelation ([8:35], [9:54], [16:123], [21:73], [22:27], [28:27]). Verse [16:123] is direct proof that all religious practices in Islam were intact when Muhammad was born. Muhammad was enjoined to “follow the religion of Abraham.” If I ask you to buy a color TV, it is assumed that you know what a color TV is. Similarly, when God enjoined Muhammad to follow the practices of Abraham ([16:123]), such practices must have been well known.

## Divine Preservation of Religious Practices

Another proof of divine preservation of the Islamic practices given to Abraham is the “Universal Acceptance” of such practices. There is no dispute concerning the number of Rak'ahs in all five daily prayers. This proves the divine preservation of Salat.

> Mathematical Confirmation of the Five Prayers
>
> The Quran's mathematical code confirms the number of Rak'ahs in the five prayers 2, 4, 4, 3, and 4, respectively. The number 24434 is a multiple of 19.

The Quran deals only with practices that were distorted. For example:

- •The distorted ablution is restored in [5:6] to its original four steps.
- •The tone of voice during the contact prayers (Salat) was distorted - many Muslims pray silently. This was corrected in the Quran, [17:110].
- •The fasting during Ramadan was modified in the Quran to allow intercourse during the night ([2:187]).
- •Zakat is restored in [6:141], and Hajj is restored to the four correct months (see [Appendix 15](/appendices/15)).

United Submitters International / International Community of Submitters / Masjid Tucson
$md$, 'zRNjUb2siNc', 'Appendix 9 — Abraham: Original Messenger of Islam'),

-- Appendix 10: God's Usage of the Plural Tense
('10', $md$> “I am God. There is no other god besides Me.”
>
> [20:14]

In the English speaking world, where the trinity doctrine is prevalent, some people are intrigued by God's usage of the plural tense in the Quran. The overwhelming message of the Quran, where there is absolutely no compromise is that “GOD IS ONE” ([2:133], [2:163]; [4:171]; [5:73]; [6:19]; [9:31]; [12:39]; [13:16]; [14:48], [14:52]; [16:22], [16:51]; [18:110]; [21:108]; [22:34]; [37:4]; [38:65]; [39:4]; [40:16]; [41:6]; [112:1]).

Whenever the first person plural form is used by the Almighty, it invariably indicates participation of other entities, such as the angels. For example, the revelation of this Quran involved participation of the angel Gabriel and the prophet Muhammad. Hence the use of the plural form in [15:9]: “We revealed this scripture, and we will preserve it.” The plural form here simply reflects the fact that the angel Gabriel and the prophet Muhammad participated in the process of delivering the Quran.

## Adam vs. Jesus

Another example has to do with blowing the breath of life into Adam and Jesus. The creation of Adam took place in heaven and God directly blew into him the breath of life. Thus, the first person singular form is consistently used: *“I blew into Adam from My spirit”* ([15:29], [38:72]). The creation of Jesus, on the other hand, took place on earth, and Gabriel carried God's “word” to Mary. The plural form is consistently used when referring to the creation of Jesus ([21:91], [66:12]).

When God spoke to Moses directly, without the mediation of angels, we see that God is speaking exclusively in the singular tense: *“I am God. There is no other god besides Me. You shall worship Me alone, and observe the regular contact prayers (Salat) to commemorate Me.”* ([20:12-14]).

Whenever the worship of God is mentioned, the singular tense is used ([51:56]).
$md$, 'ONjW_ayZ1Fo', 'Appendix 10 — God''s Usage of the Plural Tense'),

-- Appendix 11: The Day of Resurrection
('11', $md$> “The horn is blown, whereupon everyone in the heavens and the earth is struck unconscious, except those spared by God. Then it is blown a second time, whereupon they rise up.”
>
> [39:68]

All generations of humans and jinns will be resurrected on this earth; about 150 billion of them. But we will not be earthbound. God teaches us through the example of the caterpillar; it turns into a pupa in the cocoon (grave), then exits the cocoon as an airborne butterfly. Similarly, we live here on earth, and when we exit the grave on the Day of Resurrection we will not be earthbound; like the butterfly ([101:4]).

The earth will shine with the light of God ([39:69]) as He comes to our universe, together with the angels ([89:22]). Since our universe is a temporary dominion for Satan, it cannot stand the physical presence of God ([7:143]). As the Almighty approaches, the stars will crash into one another ([77:8], [81:2]), and the earth will shatter under our feet ([69:14], [89:21]). These horrors will not worry the believers ([21:103]).

> The High Heaven
>
> Upon arrival of Almighty God, all the humans and jinns will be automatically stratified according to their degree of growth and development. Those who nourished their souls through worshiping God alone, believing in the Hereafter, and leading a righteous life will be strong enough to stay close to God; they will occupy the highest ranks (see [Appendix 5](/appendices/5)).

> The Lower Heaven
>
> Those who developed their souls to a lesser degree, as well as those who die before the age of forty, will move downward to the Lower Heaven. They will go to the location where they can be as close to God as their degree of growth and development permits them to be.

> The Purgatory
>
> There will be people who nourished their souls just enough to spare them Hell, but not enough to enter the Lower Heaven. They are neither in Hell, nor in Heaven. They will implore God to admit them into the Lower Heaven ([7:46-50]). God will have mercy on them, and will merge the Purgatory into the Lower Heaven.

> Hell
>
> A new, eighth universe will be created to house those who run away from God due to their weakness; they failed to nourish and develop their souls ([69:17]). God does not put a single being in Hell; they go to it on their own volition ([Appendix 5](/appendices/5)).

United Submitters International / International Community of Submitters / Masjid Tucson
$md$, '1pvtPUiJ4WM', 'Appendix 11 — The Day of Resurrection'),

-- Appendix 12: Role of the Prophet Muhammad
('12', $md$> “The sole duty of the messenger is to deliver the message.”
>
> [5:99]

The Prophet's sole mission was to deliver Quran, the whole Quran, and nothing but Quran ([3:20]; [5:48-50], [5:92], [5:99]; [6:19]; [13:40]; [16:35], [16:82]; [24:54]; [29:18]; [42:48]; [64:12]).

Delivering the Quran was such a momentous and noble mission that the Prophet did not have any time to do anything else. Moreover, the Prophet was enjoined in the strongest words from issuing any religious teachings besides the Quran ([69:38-47]). He was even enjoined from explaining the Quran ([75:15-19]) — God is the only teacher of the Quran ([55:1-2]) and the Quran is the best Hadith ([39:23] & [45:6]).

## Hadith & Sunna: A Later Fabrication

These Quranic facts are manifested in the historical reality that the words and actions (Hadith & Sunna) attributed to the Prophet did not appear until the second century after his death. The Quran has prophesied the fabrication of Hadith and Sunna by the Prophet's enemies ([6:112-115]). The Quran teaches us that it was God's will to permit the invention of Hadith and Sunna to serve as criteria for exposing those who believe only with their lips, not in their hearts. Those who are attracted to Hadith and Sunna are proven to be false believers ([6:113]). Ironically, the books of Hadith report the Prophet's orders to write down nothing from him except the Quran! Shown below are two such Hadiths taken from the Hadithists' most reliable sources, Sahih Muslim and Is-haah Ahmad Ibn Hanbal:

> The Prophet said, “Do not write down anything from me except the Quran.”
>
> [Ahmed, Vol. 1, Page 171, and Sahih Muslim]

> This Hadith states that the Prophet maintained his anti-Hadith stand until death.
>
> [Ahmed, Vol. 1, Page 192]
$md$, 'vyhPUP1Letc', 'Appendix 12 — Role of the Prophet Muhammad'),

-- Appendix 13: The First Pillar of Submission
('13', $md$Verse [3:18] states the First Pillar of Islam (Submission):

> “God bears witness that there is no other god besides Him, and so do the angels and those who possess knowledge.”
>
> [3:18]

This most crucial pillar has been distorted. Millions of Muslims have adopted Satan’s polytheistic version, and insist upon mentioning the name of Muhammad besides the name of God. However, the Quran’s great criterion in [39:45] stamps such Muslims as disbelievers:

> “When God ALONE is mentioned, the hearts of those who do disbelieve in the Hereafter shrink with aversion, but when others are mentioned with Him, they become satisfied.”
>
> [39:45]

I have conducted extensive research into this criterion, and I have reached a startling conclusion: the idol worshipers who do not uphold the First Pillar of Islam as dictated in [3:18] are forbidden by God from uttering the correct *Shahadah*. They simply cannot say: “*Ash-hadu Allaa Elaaha Ellaa Allah*” by itself, without mentioning the name of Muhammad. Try it with any idol worshiper who claims to be a Muslim. Challenge them to say: “*Ash-hadu Allaa Elaaha Ellaa Allah*.” They can never say it. Since this is the religion of Abraham ([2:130], [2:135]; [3:95]; [4:125]; [6:161]; [12:37]\-[12:38]; [16:123]; [22:78]; [Appendix 9](/appendices/9)), the ONLY creed must be “*LAA ELAAHA ELLAA ALLAH* (there is no god except the One God)”. Muhammad did not exist on earth before Abraham.

## A Gross Blasphemy

There is no greater blasphemy than distorting the Quran to idolize the prophet Muhammad against his will. Verse 19 of Sura “Muhammad” ([47:19]) states: “You shall know that there is no god except the one God.” Shown below is a photocopy of the regular logo of a Muslim publication *THE REVIEW OF RELIGIONS* (The London Mosque, 16 Gressenhall Road, London SW18 5QL, England). Using the Quran’s calligraphic style, the publishers of *THE REVIEW OF RELIGIONS* added the phrase “*Muhammad Rasool Allah*” in such a way that gives a false impression that such is the Quranic statement of [47:19]. What a blasphemy!

> You shall know that there is no god besides the One God, Allah. Muhammad is a messenger of God.
>
> [ The blasphemy ]
>
> Typical Example of the Distorted Islam
$md$, 'Ia54Hfyclv8', 'Appendix 13 — The First Pillar of Islam'),

-- Appendix 14: Predestination
('14', $md$> “Anything that happens on earth, or to you, has already been recorded, even before the creation. This is easy for God to do.”
>
> [57:22]

We are absolutely free to believe or disbelieve in God. It is God's will that we will ([18:29], [25:57], [73:19], [74:37], [76:29], [78:39], [80:12]).

After committing our original sin ([Appendix 7](/appendices/7)), God gave us a chance to denounce our crime and accept His absolute authority ([33:72]). But we decided that we wanted to see a demonstration of Satan's competence as a god. Many people protest the fact that God has created them, to put them through this gruesome test. Obviously, such people are not aware that [1] they have committed a horrendous crime (Introduction & [Appendix 7](/appendices/7)), and [2] that they were given a chance to denounce their crime and redeem themselves, but they chose to go through the test.

## Free Will Within God's Full Knowledge

We learn from [57:22] that our lives, along with everything else around us, are pre-recorded on something like a videotape. God fully knows what kind of decision each of us is destined to make; He knows which of us are going to Heaven and which are going to Hell. Even before we were born into this world, God knew which souls are good and which souls are evil. As far as God's omniscience is concerned, we can imagine a stamp on everyone's forehead that says “Heaven” or “Hell.” Yet, as far as we are concerned, we are totally free to side with God's absolute authority, or Satan's polytheistic views. Predestination, therefore, is a fact as far as God is concerned, not as far as we are concerned.

## Quranic Examples

This understanding explains the numerous verses stating that “God guides whomever He wills, and misleads whomever He wills.” Based on His knowledge, God assigns our souls to the circumstances that we deserve. When God said to the angels, “I know what you do not know” ([2:30]), this meant that some of us deserved a chance to redeem ourselves. One example of God's guidance for those who deserve guidance is found in [21:51]: “We granted Abraham his guidance, for we were fully aware of him.” In other words, God knew that Abraham was a good soul who deserved to be guided, and God granted him his guidance and understanding. Another good example is stated in [12:24]. Joseph fell for the Egyptian nobleman's wife, and almost committed adultery “if it were not that he saw a sign from his Lord.” God teaches us in [12:24] that He “diverted evil and sin from Joseph, for he was one of My devoted worshipers.” Was it Joseph who controlled his lust? Or, was it God's protection from sin that rendered him chaste? Such is predestination.
$md$, 'ycRUmiOuRiM', 'Appendix 14 — Predestination'),

-- Appendix 15: Religious Duties: Gift from God
('15', $md$When Abraham implored God in [14:40], he did not ask for wealth or health; the gift he implored for was: *“Please God, make me one who observes the contact prayers (Salat).”* The religious duties instituted by God are in fact a great gift from Him. They constitute the nourishment required for the growth and development of our souls. Without such nourishment, we cannot survive the immense energy associated with God’s physical presence on the Day of Judgment. Belief in God does not by itself guarantee our redemption; we must also nourish our souls ([6:158], [10:90]–[10:92]). Additionally, [15:99] states that observing the religious duties instituted by God is our means of attaining certainty: *“Worship your Lord in order to attain certainty.”*

## The Contact Prayers (Salat)

The five daily contact prayers are the main meals for the soul. While a soul may attain some growth and development by leading a righteous life, and without observing the contact prayers, this would be like surviving on snacks without regular meals.

We learn from [2:37] that we can establish contact with God by uttering the specific Arabic words given to us by God. Sura 1, The Key, is a mathematically composed combination of sounds that unlocks the door between us and God:

The Five Daily Prayers

| Prayer | Time | Units | Reference |
| --- | --- | --- | --- |
| Dawn | During the two hours before sunrise | 2 | 11:114, 24:58 |
| Noon | When the sun declines from its highest point at noon | 4 | 17:78 |
| Afternoon | During the 3-4 hours preceding sunset | 4 | 2:238 |
| Sunset | After sunset | 3 | 11:114 |
| Night | After the twilight disappears from the sky | 4 | 24:58 |

The Friday noon congregational prayer is an obligatory duty upon every Submitting man and woman ([62:9]). Failure to observe the Friday Prayer is a gross offense.

Each contact prayer is valid if observed anytime during the period it becomes due until the next prayer becomes due. Once missed, a given contact prayer is a missed opportunity that cannot be made up; one can only repent and ask forgiveness. The five prayers consist of 2, 4, 4, 3, and 4 units (Rak’ahs), respectively.

The proof that Salat was already established through Abraham is found in [8:35], [9:54], [16:123], & [21:73]. This most important duty in Islam (Submission) has been so severely distorted that the contact prayers (Salat) have become a practice in idolatry for the vast majority of Muslims. Although the Quran commands that our contact prayers must be devoted to God alone ([20:14]; [39:3], [39:45]), today’s Muslims insist on commemorating “Muhammad and his family” and “Abraham and his family” during their prayers. This renders the prayers null and void ([39:65]).

The following text, pertaining to the miracles confirming the contact prayers, is excerpted (with minor editing), from the January 1990 issues of the Submitter’s Perspective (the regular and special bonus issues), as written by Dr. Rashad Khalifa:

## Awesome Mathematical Miracle Confirms All The 5 Contact Prayers

**[1]** Sura 1 is God’s gift to us, to establish contact with Him (Salat). Write the sura number and the number of verses next to each other and you get 17, the total number of units in the 5 daily prayers.

**[2]** Let us write down the sura number, followed by the number of every verse in the sura. This is what we get:

```
1 1 2 3 4 5 6 7
```

This number is a multiple of 19.

Properties of Sura 1, The Key

| Verse No | No of Letters | Gematrical Value |
| --- | --- | --- |
| 1 | 19 | 786 |
| 2 | 17 | 581 |
| 3 | 12 | 618 |
| 4 | 11 | 241 |
| 5 | 19 | 836 |
| 6 | 18 | 1072 |
| 7 | 43 | 6009 |

**[3]** Now, let us replace each verse number by the number of letters in that verse. This is what we get:

```
1 19 17 12 11 19 18 43
```

also a multiple of 19. Theoretically, one can alter the letters of Sura 1, and still keep the same number of letters, however, the following mathematical phenomena rule out that possibility. For the gematrical value of every single letter is taken into consideration. Here it is:

**[4]** Let us include the gematrical value of every verse, and write it down following the number of letters in each verse:

```
1 19 786 17 581 12 618 11 241 19 836 18 1072 43 6009
```

also a multiple of 19.

**[5]** Now, let us add the number of each verse, to be followed by the number of letters in that verse, then the gematrical value of that verse. This is what we get:

```
1 1 19 786 2 17 581 3 12 618 4 11 241 5 19 836 6 18 1072 7 43 6009
```

a multiple of 19.

**[6]** Instead of the gematrical values of every verse, let us write down the gematrical values of every individual letter in Sura 1. This truly awesome miracle, shows that the resulting long number, consisting of 274 digits, is also a multiple of 19. ALLAHU AKBAR.

```
1 7 1 19 2 60 40 1 30 30 5 1 30 200 8 40 50 1 30 200 8 10 40 2 17 ... 50
```

This number starts with the sura number, followed by the number of verses in the sura, followed by the verse number, followed by the number of letters in this verse, followed by the gematrical values of every letter in this verse, followed by the number of the next verse, followed by the number of letters in this verse, followed by the gematrical values of every letter in this verse, and so on to the end of the sura. Thus, the last component is 50, the value of “N” (last letter).

**[7]** Since I cannot write very long numbers here, let us substitute [\*] for the long number consisting of the number of every verse, followed by the number of letters in the verse, followed by the gematrical value of every individual letter in the verse. If we write down the number of the sura, followed by its number of verses, we get 17, the number of units (Rak’aas) in the 5 daily prayers. Next to the 17, write down the number of the first prayer (1), followed by its number of Rak’aas, which is 2, then two [\*]’s, followed by the number of the second prayer (2), followed by the number of Rak’aas in the second prayer (4), followed by four [\*]’s, and so on. Not only is the resulting long number a multiple of 19, but also the number of its component digits is 4636 (19x244) ....

```
17 12[*][*] 24[*][*][*][*] 34[*][*][*][*] 43[*][*][*] 54[*][*][*][*]
```

## Confirmation of Friday Prayers

**[8]** Since the Friday prayer consists of two sermons and two Rak’aas (total is still 4 units), we read only 15 “Keys” on Friday, compared with 17 on the other days. Abdullah Arik discovered that if we replace the 17 by 15 in the long number in [7], we must remove two “Keys” from the noon prayer to get a multiple of 19. This confirms the Friday Prayer, at noon, with 2 “Keys.” The long number shown below represents Friday’s five prayers; it is a multiple of 19.

```
15 12[*][*] 24[*][*] 34[*][*][*][*] 43[*][*][*] 54[*][*][*][*]
```

Please note that, Dr. Khalifa indicated, there are other similar patterns that result in multiples of 19. For example, a short representation of “The Key” consists of the Sura number (1), followed by the number of verses (7), followed by the total number of letters in Sura 1 (139), followed by the total gematrical value of the whole sura (10143). The resulting number (1713910143) representing [\*] can be used in the above patterns, without including the sequence number of the prayers. The resultant numbers for both regular and Friday prayer representations are multiples of 19. For example, here is the pattern for the regular prayers:

```
17 2[*][*] 4[*][*][*][*] 4[*][*][*][*] 3[*][*][*] 4[*][*][*][*]
```

## “The Key” (Al-Fateha) Must Be Recited in Arabic

**[9]** The first sura in the Quran is mathematically composed in a manner that challenges and stumps the greatest mathematicians on earth. Now we appreciate the fact that when we recite Sura 1, “The Key,” during our Contact Prayers, something happens in the universe, and we establish contact with our Creator. The result is perfect happiness, now and forever. By contacting our Almighty Creator 5 times a day, we nourish and develop our souls in preparation for the Big Day when we meet God. Only those who nourish their soul will be able to withstand and enjoy the physical presence of Almighty God.

All submitters, of all nationalities, recite the words of “The Key” which were written by God Himself, and given to us to establish contact with Him ([2:37]).

Edip Yuksel’s discovery adds to the awesomeness of “The Key” and proclaims clearly that it must be recited in Arabic.

When you recite “The Key” in Arabic, your lips touch each other precisely 19 times.

Furthermore, your lips touch each other where the letters “B” and “M” occur. There are 4 “B’s” and 15 “M’s” and this adds up to 19. The gematrical value of the 4 “B’s” is 4x2=8, and the gematrical value of the 15 “M’s” is 15x40=600. The total gematrical value of the 4 “B’s” and 15 “M’s” is 608, that is 19x32.

Lip-Touch Letters in Al-Fateha

| \# | Word | Letter | Value |
| --- | --- | --- | --- |
| 1. | Bism | B | 2 |
| 2. | Bism | M | 40 |
| 3. | Rahman | M | 40 |
| 4. | Rahim | M | 40 |
| 5. | Al-Hamdu | M | 40 |
| 6. | Rub | B | 2 |
| 7. | \`Alamin | M | 40 |
| 8. | Rahman | M | 40 |
| 9. | Rahim | M | 40 |
| 10. | Malik | M | 40 |
| 11. | Yawm | M | 40 |
| 12. | Na'budu | B | 2 |
| 13. | Mustaqim | M | 40 |
| 14. | Mustaqim | M | 40 |
| 15. | An\`amta | M | 40 |
| 16. | \`Alayhim | M | 40 |
| 17. | Maghdub | M | 40 |
| 18. | Maghdub | B | 2 |
| 19. | \`Alayhim | M | 40 |
| Total | 608 (19x32) |   |   |

## Confirmation of the 5 Daily Prayers, Number of Bowings (Ruku'), Prostrations (Sujood), and Tashahhud

**[10]** One of the common challenges... is: “If the Quran is complete and detailed (as claimed in [6:19], [6:38], & [6:114]), where are the details of the Contact Prayers (Salat)?” These people ask this question because they are not aware that the Quran informs us that the Contact Prayers came from Abraham ([21:73] & [22:78]).... Saeed Talari... wrote down the numbers of the prayers with their bowings, prostrations and Tashahhuds...:

```
1 1 2 2 4 1 2 4 4 8 2 3 4 4 8 2 4 3 3 6 2 5 4 4 8 2
```

This long number consists of the sura that we recite in the 5 prayers (1) followed by the number of the first prayer (1), then the number of “Keys” that we recite in this prayer (2), then the number of bowings (Ruku\`) (2), then the number of prostrations (4), then the number of Tashahhuds (in the sitting position) (1), then the number of the second prayer (2), then the number of “Keys” that we recite in the second prayer (4), then the number of bowings (Ruku\`) in this prayer (4), then the number of prostrations (8), then the number of Tashahhuds (2), then the number of the third prayer (3), and so on to the last prayer. This long number is a multiple of 19, and this confirms the minutest details of the prayers, even in the numbers of Ruku\`, Sujud, and Tashahhud.

## The Obligatory Charity (Zakat)

Zakat must be given away “on the day of harvest” ([6:141]). Whenever we receive “net income,” we must set aside 2.5% and give it to the specified recipients — the parents, relatives, orphans, the poor, and the traveling alien, in this order ([2:215]). The vital importance of Zakat is reflected in God’s law: *“My mercy encompasses all things, but I will specify it for the righteous who give Zakat”* ([7:156]).

Zakat must be carefully calculated and given away on a regular basis whenever we receive any income. Government taxes should be deducted, but not other expenses such as debts, mortgages, and living expenses. If one does not know needy persons, he or she may give the Zakat to a mosque or charitable organization with the distinct purpose of helping poor people. Charities given to mosques or hospitals or organizations cannot be considered Zakat.

## Fasting

The full details of fasting are given in [2:183]–[2:187].

## Pilgrimage: Hajj & 'Umrah

Once in a lifetime, Hajj and ‘Umrah are decreed for those who can afford it. Pilgrimage commemorates Abraham’s exemplary submission to God ([Appendix 9](/appendices/9)), and must be observed during the four Sacred Months — Zul-Hijjah, Muharram, Safar, & Rabi\` I (12th, 1st, 2nd, 3rd months) ([2:197]; [9:2], [9:36]). ‘Umrah can be observed any time. Like all other duties in Islam, Hajj has been distorted. Most Muslims observe Hajj only during a few days in Zul-Hijjah, and they consider Rajab, Zul-Qi’dah, Zul-Hijjah, and Muharram (7th, 11th, 12th, 1st months) to be the Sacred Months. This is a distortion that is strongly condemned ([9:37]).

The pilgrimage begins with a bath or shower, followed by a state of sanctity called “Ihraam,” where the male pilgrim wears seamless sheets of material, and the woman wears a modest dress ([2:196]). Throughout Hajj, the pilgrim abstains from sexual intercourse, vanities such as shaving and cutting the hair, arguments, misconduct, and bad language ([2:197]). Cleanliness, bathing, and regular hygiene practices are encouraged. Upon arrival at the Sacred Mosque in Mecca, the pilgrim walks around the Ka\`bah seven times, while glorifying and praising God ([2:125], [22:26]–[22:29]). The common formula is: “Labbayka Allaahumma Labbayk” (My God, I have responded to You). “Labbayka Laa Shareeka Laka Labbayk” (I have responded to You, and I proclaim that there is no other god besides You; I have responded to You). The next step is to walk the half-mile distance between the knolls of Safa and Marwah seven times, with occasional trotting ([2:158]). This completes the ‘Umrah portion of the pilgrimage.

The pilgrim then goes to ‘Arafat to spend a day of worship, meditation, and glorification of God, from dawn to sunset ([2:198]). After sunset, the pilgrim goes to Muzdalifah where the Night Prayer is observed, and 21 pebbles are picked up for the symbolic stoning of Satan at Mina. From Muzdalifah, the pilgrim goes to Mina to spend two or three days ([2:203]). On the first morning at Mina, the pilgrim offers an animal sacrifice to feed the poor and to commemorate God’s intervention to save Ismail and Abraham from Satan’s trick ([37:107], [Appendix 9](/appendices/9)). The stoning ceremonies symbolize rejection of Satan’s polytheism and are done by throwing seven pebbles at each of three stations, while glorifying God ([15:34]). The pilgrim then returns to Mecca and observes a farewell circumvolution of the Ka\`bah seven times.

Unfortunately, most of today’s Muslim pilgrims make it a custom to visit the prophet Muhammad’s tomb where they commit the most flagrant acts of idolatry and thus nullify their Hajj. The Quran consistently talks about “The Sacred Mosque,” while today’s Muslims talk about “The Two Sacred Mosques!” In a glaring act of idolatry, the Muslims have set up Muhammad’s tomb as another “Sacred Mosque!” This is a blasphemous violation of the Quran, and, ironically, even violates Hadith. The Hadith shown below illustrates this strange irony:

> “God has cursed the Jews and Christians for turning the tombs of their prophets into mosques.”
>
> Translation of this false statement. [Bukhari, Nawawi Edition, Vol. 6, Page 14]

## Physical Benefits

In addition to their invaluable spiritual benefits, there is a plethora of physical, economic, and health benefits from observing the contact prayers (Salat), obligatory charity (Zakat), fasting during the month of Ramadan, and Hajj.

Observing the Dawn prayer interrupts long periods of stillness during sleep; this is now proven to help prevent arthritis. Also, getting up early in the morning helps combat depression and other psychological problems. The prostration position which is repeated during the contact prayers expands the blood vessels in our brains to accommodate more blood, and this prevents headaches. The repeated bending of the back and the joints is a healthful exercise. All these are scientifically established facts.

The ablutions required prior to the contact prayers encourage us to use the toilet more frequently. This habit protects us from a common and devastating cancer, colon cancer. Harmful chemicals are excreted in the urine and fecal matter. If these excretions are kept in the colon for prolonged periods of time, the harmful materials are re-absorbed into the body, and cause cancer.

Fasting during the month of Ramadan restores our expanded stomachs to their normal sizes, lowers our blood pressure through temporary dehydration, rids the body of harmful toxins, gives our kidneys a much needed rest, and reduces our weight by removing excessive and harmful fat.

Zakat charity and Hajj pilgrimage have far reaching economic and social benefits.
$md$, NULL, NULL),

-- Appendix 16: Dietary Prohibition
('16', $md$> “Say, ‘I do not find in what was revealed to me anything prohibited for any eater unless it is (1) carrion, (2) running blood, (3) the meat of pigs, for it is unclean, and (4) meat blasphemously dedicated to other than God.’ If one is forced to eat these without being malicious or deliberate, then your Lord is Forgiver, Most Merciful.”
>
> [6:145]

The Quran teaches that God is extremely displeased with those who prohibit anything that was not specifically prohibited in the Quran ([16:112]–[16:116]). The upholding of any prohibitions not specifically mentioned in the Quran is tantamount to idolatry ([6:142]–[6:152]). Such prohibitions represent some other god(s) besides God. If you worship God ALONE, you will uphold His teachings ALONE and honor the commandments and prohibitions instituted only by Him.

The absolute specificity of dietary prohibitions in the Quran is best illustrated in [6:145]–[6:146]. We learn from these two verses that when God prohibits “meat,” He prohibits “meat” and nothing else, and when He prohibits “fat,” that is what He specifically prohibits. These two verses inform us that “the meat” of pigs is prohibited, not “the fat.” Obviously, God knew that in many countries, lard would be used in baked goods and other food products, and that such usage does not render the foods Haraam (prohibited). The Quran specifically prohibits four meats ([2:173], [5:3], [6:142]–[6:145], and [16:112]):

> The Four Prohibited Meats ([6:145])
>
> 1. carrion
> 2. running blood
> 3. the meat of pigs, for it is unclean
> 4. meat blasphemously dedicated to other than God
$md$, 'o7GJwyv_ZRM', 'Appendix 16 — Dietary Prohibitions'),

-- Appendix 17: Death
('17', $md$Death is a great mystery to most people. Not so for the students of the Quran. We learn that death is exactly like sleeping; complete with dreams ([6:60], [40:46]). The period between death and resurrection passes like one night of sleep ([2:259]; [6:60]; [10:45]; [16:21]; [18:11], [18:19], [18:25]; [30:55]).

At the moment of death, everyone knows his or her destiny; Heaven or Hell. For the disbelievers, death is a horrible event; the angels beat them on the faces and rear ends as they snatch away their souls ([8:50], [47:27], [79:1]).

Consistently, the Quran talks about two deaths, the first death took place when we failed to make a stand with God’s absolute authority ([Appendix 7](/appendices/7)). That first death lasted until we were born into this world. The second death terminates our life in this world ([2:28], [22:66], [40:11]).

> The following page is a reproduction of the lead article from the February, 1990 issue of the Submitters Perspective, the monthly bulletin of United Submitters International. This issue was completed and mailed ahead of time, in December, 1989. Dr. Khalifa was martyred on January 31, 1990 and his soul was taken directly to Paradise.

## New Major Revelation: Great News for the Believers — The Righteous Do Not Really Die, They Go Straight to Heaven

> “Give good news to those who believe and work righteousness that they will have gardens with flowing streams. When provided with provisions of fruits therein, they will say, ‘This is what was given to us in the past.’ They will be given similar provisions, and they will have pure spouses therein. They abide therein forever.”
>
> — [2:25]

> “Do not think that those who are killed in the cause of God are dead; they are alive at their Lord, being provided for.”
>
> — [3:169]

> “Do NOT say about those who are killed in the cause of God, ‘They are dead’ For they are alive, but you do not perceive.”
>
> — [2:154]

> “O you who believe, you shall respond to God and the messenger when he invites to what keeps you alive.”
>
> — [8:24]

> “Those who emigrate in the cause of God, then get killed or die, God will surely provide for them a good provision.”
>
> — [22:58]

> “They do not taste death, beyond the first death, and God spares them the retribution of Hell.”
>
> — [44:56]

> “He was told, ‘Enter Paradise.’ He said, ‘I wish my people (on earth) know, that my Lord has forgiven me and honored me.’”
>
> — [36:26]–[36:27]

> The wages of sin is death.
>
> [Romans 6:23]

As stated in [3:81] and [46:9], God’s Messenger of the Covenant does not bring anything new; everything I receive and pass on to you is already in the Quran. However, the Quran is full of information that is kept by Almighty God for revelation at a specific time. Now is the time to look at the verses shown above and learn the great news: THE RIGHTEOUS DO NOT DIE; when their lives on this earth come to the predetermined end, the angel of death simply invites them to leave their earthly bodies and move on to Heaven, the same Paradise where Adam and Eve once lived. Heaven has been in existence since Adam and Eve. We learn from [89:27]–[89:30] that God invites the believers’ souls: “Enter My Paradise.”

## My Own Experience

When God’s covenant with the prophets was fulfilled in accordance with [3:81], I was taken to Heaven where the righteous live NOW ([4:69]). While my body was down here on earth, I was in the same Paradise of Adam & Eve.

## The Disbelievers

As for the disbelievers, they know at the moment of death that they are destined for Hell. The angels beat them up on the faces and rear ends ([8:50] & [47:27]), order them to evict their souls ([6:93]), then “snatch their souls” ([79:1]). The Quran teaches that the disbelievers go through 2 deaths ([2:28] & [40:11]). They will be put to death — a state of nothingness during which they see Hell day and night in a continuous nightmare that lasts until the Day of Judgment ([40:46]). Hell is not yet in existence ([40:46], [89:23]).

## Of Course, the Righteous Depart

As far as people are concerned, the righteous “die.” People do not realize that the righteous simply leave their bodies, and move on to Paradise. The verses shown above are self explanatory. They tell us that the righteous die only once — the one death we have already experienced as a consequence of the great fued ([38:69]). In [36:26]–[36:27], we see the best evidence that the righteous go to Paradise, while their friends and relatives are still living on earth. Like going to Hawaii and waiting for us there.

See also [16:32] & [6:60]–[6:62].
$md$, 'UW0MnqokXvY', 'Appendix 17 — Death'),

-- Appendix 18: Quran is All You Need
('18', $md$> “We did not leave anything out of this book.”
>
> [6:38]

The words of the Quran speak in [19:64], saying, “We come down in accordance with the commandments of your Lord. To Him belongs the past, present, and the future. Your Lord never forgets.” God did not forget, for example, to tell us how to sleep ([18:109], [31:27]). Yet, the fabricators of such false doctrine as Hadith & Sunna have come up with religious teachings dictating on their followers how to sleep, and even how to cut your nails. The Sacred Mosque in Mecca and the illegal “Sacred Mosque” of Medina, hire some individuals to seek out the exhausted visitors and beat them with a stick if they fall asleep on the wrong side!

The Quran proclaims that the Quran is complete, perfect, and fully detailed ([6:19], [6:38], [6:114], [6:115]; [50:45]), and that religious regulations not specifically instituted in the Quran constitute a religion other than Islam ([42:21], [17:46]). The true believers uphold the Quran, the whole Quran, and nothing but the Quran.

This principle is confirmed by the Quran's mathematical code. Verse 46 of Sura 17 proclaims that we shall uphold the Quran ALONE. The word “ALONE” occurs in the Quran 6 times: [7:70], [17:46], [39:45], [40:12], [40:84], and [60:4]. All these occurrences refer to God, except [17:46]. When we add the numbers of suras and verses which refer to “GOD ALONE,” we get 361, 19x19. This proves that [17:46] refers to “the Quran ALONE.”
$md$, 'kc6zPAeY83Q', 'Appendix 18 — Quran: All You Need For Salvation'),

-- Appendix 19: Hadith and Sunna: Satanic Innovations
('19', $md$> “Which Hadith, other than God and His revelations, do they uphold?”
>
> [45:6]
>
> “The Quran is not a fabricated Hadith; ...it details everything.”
>
> [12:111]
>
> “Some people uphold vain Hadith to divert others from the path of God.”
>
> [31:6]
>
> “The only Sunna to follow shall be God's Sunna.”
>
> [17:77], [33:62], [48:23], [6:114]

The Quran informs us that some enemies of the Prophet, described as “human and jinn devils,” will fabricate lies and attribute them to the Prophet ([6:112], [25:31]). This is precisely what happened after the prophet Muhammad’s death; *Hadith* (oral) and *Sunna* (actions) were invented and attributed to the Prophet. *Hadith* and *Sunna* are satanic innovations because they:

1. defy the divine assertions that the Quran is complete, perfect, fully detailed, and shall be the only source of religious guidance ([6:19], [6:38], [6:114] & [45:6]-7),
2. blaspheme against the Prophet and depict him as a vicious tyrant who did not uphold the Quran, and
3. create false doctrines based on superstition, ignorance, and indefensible nonsensical traditions.

The prophet Muhammad was enjoined, in very strong words, from issuing any religious teachings besides the Quran ([69:38]-48).

Some Muslims compromise: “If a *Hadith* agrees with the Quran we will accept it, and if it contradicts the Quran, we will reject it!” Such premise proves that these people do not believe God’s assertions that the Quran is “complete, perfect and fully detailed.” The moment they seek guidance from anything besides the Quran, no matter how “right” it seems, they fall into Satan’s trap (see [63:1]). For they have rejected God’s word and set up another god besides God ([18:57]). See [Appendix 33](/appendices/33).

The Quran’s mathematical miracle provides mathematical evidence that the Quran shall be our only source of religious teachings. Here are just 2 examples:

> 1\. [6:38]
>
> “We did not leave anything out of this book,” is in Verse 38 (19x2) and consists of 19 Arabic letters.
>
> 2\. [6:114]
>
> “He sent down this book fully detailed,” is in Verse 114 (19x6) and consists of 19 Arabic letters.
$md$, '2UxqrtHtYd0', 'Appendix 19 — Hadith & Sunna: Satanic Innovations'),

-- Appendix 20: Quran: Unlike Any Other Book
('20', $md$> “The Most Gracious. Teacher of the Quran.”
>
> [55:1-2]

The Quran is God's Final Testament to the world, and He has pledged to protect it from the slightest distortion ([15:9]). Thus, the Quran is surrounded by invisible forces that guard it and serve it ([13:39], [41:42], [42:24]).

Unlike any other book, the Quran is taught by God ([55:1]-2); He teaches us what we need at the time we need it. This is why we read the Quran hundreds of times without getting bored. We can read a novel, for example, only once. But the Quran can be read an infinite number of times, and we derive new and valuable information from it every time.

On the other hand, the insincere readers - those who read the Quran to find fault with it - are diverted from the Quran ([7:146], [17:45], [18:57], [41:44]). In fact, God's invisible forces help them find the faults they seek. Since the Quran is perfect, such “faults” serve only to reveal the stupidity of God's enemies.

## God's Attributes for the Quran

God uses His own attributes to describe the Quran; He calls the Quran “ʿAzeem = Great” ([15:87]), “Hakeem = Full of wisdom” ([36:2]), “Majid = Glorious” ([50:1]), and “Karim = Honorable” ([56:77]). What can we say?

## Accessible to All Believers

Since the Quran is God's message to all the people, regardless of their language, the Quran is accessible to the believers, regardless of their language ([41:44]). This explains a profound phenomenon: the believers who do not know Arabic know the Quran better than the Arabic speaking unbelievers.

Because of the invisible forces serving the Quran, it is readily and enjoyably accessible to the sincere believers, and utterly inaccessible to the unbelievers ([17:45], [18:57], [56:79]).
$md$, 'vQwdGHGu570', 'Appendix 20 — Quran: Unlike Any Other Book'),

-- Appendix 21: Satan: Fallen Angel
('21', $md$In God’s kingdom, certain creatures are necessarily given the powers needed to perform their duties. Satan believed that his God-given powers qualified him to function as an independent god. As evidenced by the prevalence of misery, disease, accidents, and war in his dominion, we now know that Satan is incompetent.

The Quran clearly states that Satan was an angel, by virtue of the immense powers and rank bestowed upon him. This is why he is addressed as an angel ([2:34], [7:11], [15:29], [17:61], [18:50], [20:116], [38:71]) prior to his fall. By definition, a jinn is a fallen angel ([18:50]). Satan’s rebellion teaches us that the angels were created with minds of their own, and absolute freedom of choice ([2:34]).
$md$, 'NdMD2geQbdc', 'Appendix 21 — Satan: Fallen Angel'),

-- Appendix 22: Jesus
('22', $md$> “God is my Lord and your Lord; you shall worship Him alone. This is the right path.”
>
> [3:51] · [19:36] · [43:64]

The Quran, informs us that Jesus was a human messenger of God whose sole mission was to deliver God's message; he never possessed any power, and is now dead ([4:171], [5:75], [5:117]). Those who consider Jesus to be God, or Son of God, or part of a trinity are “pagans” ([5:17], [5:72], [5:73]). Outstanding Christian scholars have reached these same conclusions (THE MYTH OF GOD INCARNATE, John Hick, ed., The Westminster Press, Philadelphia, 1977 & THE MYTH MAKER, Hyam Maccoby, Harper & Row 1986). Christianity is the product of Nicene (AD 325).

## The Bible's Jesus

Jesus proclaimed aloud: “Whoever puts faith in me believes not so much in me as in him who sent me; ..... For I have not spoken on my own; no, the Father who sent me has commanded me what to say and how to speak. Since I know that his commandment means eternal life, whatever I say is spoken just as he instructed me.”

[John 12:44-50]

“I cannot do anything of myself. I judge as I hear, and my judgment is honest because I am not seeking my own will but the will of him who sent me.”

[John 5:30]

Jesus said: “My doctrine is not my own; it comes from him who sent me.”

[John 7:16]

“Men of Israel, listen to me! Jesus the Nazorean was a man whom God sent to you with miracles, wonders, and signs as his credentials. These God worked through him in your midst, as you well know.”

[Acts 2:22]

“...The man who hears my word and has faith in him who sent me possesses eternal life.”

[John 5:24]

“Whoever welcomes me welcomes, not me, but him who sent me.”

[Mattew 10:40, Mark 9:37, Luke 9:48, & John 13:20]

“...I have not come of myself. I was sent by One who has the right to send, and him you do not know. I know him because it is from him I come; he sent me.”

[John 7:28-29]

Jesus looked up to heaven and said, “...Eternal life is this: to know you, the only true God, and him whom you have sent, Jesus Christ.”

[John 17:1-3]

All who are led by the Spirit of God are sons of God.

[Romans 8:14]

Jesus looked upward and said, “Father, I thank you for having heard me. I know that you always hear me but I have said this for the sake of the crowd, that they may believe that you sent me.”

[John 11:41-42]

As he was setting out on a journey a man came running up, knelt down before him and asked, “Good Teacher, what must I do to share in everlasting life?” Jesus answered, “Why do you call me good? No one is good but God alone.”

[Mark 10:17-18]

“None of those who call me ‘Lord’ will enter the kingdom of God, but only the one who does the will of my Father in heaven.”

[Matthew 7:21]

“...Go to my brothers and tell them, ‘I am ascending to my Father and your Father, to my God and your God.’ ”

[John 20:17]

“God is my Lord and your Lord; you shall worship Him alone. This is the right path.”

[Quran 3:51, 19:36, & 43:64]

Trinity, the doctrine of God taught by Christians that asserts that God is one in essence but three in “person,” Father, Son, and Holy Spirit. Neither the word Trinity, nor the explicit doctrine as such, appears in the New Testament, nor did Jesus and his followers intend to contradict the Shema in the Old Testament: “Hear O Israel: The Lord our God is one” (Deut. 6:4).

[Encyclopaedia Britannica, 1975]

> Jesus' soul was raised, i.e., he was put to death prior to the arrest and crucifixion of his body. Thus, his persecutors arrested, tortured, and crucified an empty body - Jesus was already gone to the world of souls ([3:55], [4:157]).

## Jesus' Death

This has been the single most controversial subject in the world. The Quran's miraculous mathematical code has now provided the final answer to this topic:

They plotted and schemed, but so did God, and God is the best schemer. Thus, God said, “O Jesus, I am putting you to death, and raising you to Me; I will save you from the disbelievers.” [Quran [3:54]-55]

They claimed that they killed the Messiah, Jesus, the son of Mary, the messenger of God! In fact, they never killed him; they never crucified him; they were led to believe that they did. [Quran [4:157]]

Mercifully, God has given our generation a living example of a person whose soul departed this world, but his body continued to live for 19 months. On November 25, 1984, doctors at the Humana Hospital of Louisville, Kentucky removed the diseased heart of Mr. William Schroeder and replaced it with a plastic and metal pump (THE NEW YORK TIMES, Monday, November 26, 1984).

On the 19th day after this historic operation - Thursday, December 13, 1984 - Mr. Schroeder, the soul, the real person, departed this world. Mr. Schroeder died. But his body continued to function with the artificial heart implanted in his body. The world was told that he “probably suffered a stroke” (THE NEW YORK TIMES, December 14, 1984). Significantly, only one day before Mr. Schroeder's departure, he talked with President Ronald Reagan on national TV, and demanded that the Social Security Administration send his overdue check. He was perfectly alert. From the moment “he suffered a stroke,” he did not recognize the day or time, nor his family members. In fact, Mr. Scroeder was no longer in this world.

The Gospels state clearly that the arrested body of Jesus was oblivious to the events surrounding it:

The chief priests, meanwhile, brought many accusations against Jesus. Pilate interrogated him again: “Surely you have some answer? See how many accusations they are leveling against you.” But greatly to Pilate's surprise, Jesus made no further response. [Mark 15:3-5]

Herod was extremely pleased to see Jesus. From the reports about him he had wanted for a long time to see him, and he was hoping to see him work some miracles. He questioned Jesus at considerable length, but Jesus made no response. The chief priests and scribes were at hand to accuse him vehemently. Herod and his guards then treated him with contempt and insult. [Luke 23:8-11]

The Savior said to me, “He whom you saw on the tree, glad and laughing, this is the living Jesus. But this one into whose hands and feet they drive the nails is the fleshly part. [Apocalypse of Peter, VII, 3, 81] from THE NAG HAMMADI LIBRARY (Harper & Row, 1977, James M. Robinson, ed, Page 339).

The facts that (1) Mr. Schroeder's soul departed on the 19th day after the operation, and (2) his body survived for 19 months, are uncanny reminders that God wanted the world to know the parallel between Schroeder's situation, and the proven account of Jesus' departure prior to the arrest, torture, and crucifixion of his soulless body.
$md$, 'seAyTYQrsPM', 'Appendix 22 — Jesus'),

-- Appendix 23: Chronological Order of Revelation
('23', $md$Order → Sura Number

| OrderSura | OrderSura | OrderSura | OrderSura | OrderSura | OrderSura |
| --- | --- | --- | --- | --- | --- |
| 196 | 20113 | 397 | 5834 | 7767 | 9613 |
| 268 | 21114 | 4072 | 5939 | 7869 | 9755 |
| 373 | 22112 | 4136 | 6040 | 7970 | 9876 |
| 474 | 2353 | 4225 | 6141 | 8078 | 9965 |
| 51 | 2480 | 4335 | 6242 | 8179 | 10098 |
| 6111 | 2597 | 4419 | 6343 | 8282 | 10159 |
| 781 | 2691 | 4520 | 6444 | 8384 | 10224 |
| 887 | 2785 | 4656 | 6545 | 8430 | 10322 |
| 992 | 2895 | 4726 | 6646 | 8529 | 10463 |
| 1089 | 29106 | 4827 | 6751 | 8683 | 10558 |
| 1193 | 30101 | 4928 | 6888 | 872 | 10649 |
| 1294 | 3175 | 5017 | 6918 | 888 | 10766 |
| 13103 | 32104 | 5110 | 7016 | 893 | 10864 |
| 14100 | 3377 | 5211 | 7171 | 9033 | 10961 |
| 15108 | 3450 | 5312 | 7214 | 9160 | 11062 |
| 16102 | 3590 | 5415 | 7321 | 924 | 11148 |
| 17107 | 3686 | 556 | 7423 | 9399 | 1125 |
| 18109 | 3754 | 5637 | 7532 | 9457 | 1139 |
| 19105 | 3838 | 5731 | 7652 | 9547 | 114110 |
$md$, NULL, NULL),

-- Appendix 24: Two False Verses Removed from the Quran
('24', $md$> A superhuman mathematical system pervades the Quran and serves to guard and authenticate every element in it. Nineteen years after the Prophet’s death, some scribes injected two false verses at the end of Sura 9, the last sura revealed in Medina. The evidence presented in this Appendix incontrovertibly removes these human injections, restores the Quran to its pristine purity, and illustrates a major function of the Quran’s mathematical code, namely, to protect the Quran from the slightest tampering. Thus, the code rejects ONLY the false injections 9:128-129.
>
> “Surely, we have revealed this scripture, and surely, we will preserve it.”
>
> [15:9]

The Quran is God’s Final Testament. Hence the divine pledge to keep it perfectly preserved. To assure us of both the divine authorship, and the perfect preservation of the Quran, the Almighty author has rendered the Quran mathematically composed. As proven by the physical evidence in [Appendix 1](/appendices/1), such mathematical composition is far beyond human capabilities. The slightest violation of God’s Final Testament is destined to stand out in glaring disharmony. A deviation by only 1 — one sura, one verse, one word, even one letter — is immediately exposed.

Nineteen years after the Prophet Muhammad’s death, during the reign of Khalifa ‘Uthman, a committee of scribes was appointed to make several copies of the Quran to be dispatched to the new Muslim lands. The copies were to be made from the original Quran which was written by Muhammad’s hand ([Appendix 28](/appendices/28)).

This committee was supervised by ‘Uthman Ibn ‘Affaan, ‘Ali Ibn Abi Taaleb, Zeid Ibn Thaabet, Ubayy Ibn Ka‘ab, ‘Abdullah Ibn Al-Zubair, Sa‘eed Ibn Al-‘Aas, and ‘Abdul Rahman Ibn Al-Haareth Ibn Heshaam. The Prophet, of course, had written the Quran in its chronological order of revelation ([Appendix 23](/appendices/23)), together with the necessary instructions to place every piece in its proper position. The last sura revealed in Medina was Sura 9. Only Sura 110, a very short sura, was revealed after Sura 9, in Mina.

The committee of scribes finally came to Sura 9, and put it in its proper place. One of the scribes suggested adding a couple of verses to honor the Prophet. The majority of scribes agreed. ‘Ali was outraged. He vehemently maintained that the word of God, written down by the hand of His final prophet, must never be altered.

‘Ali’s protest is documented in many references, but I cite and reproduce here the classic reference *AL ITQAAN FEE ‘ULUM AL QURAN* by Jalaluddin Al-Suyuty, Al-Azhareyyah Press, Cairo, Egypt, 1318 AH, Page 59 [see Insert 1].

> ![Original Arabic text of ‘Ali’s protest from Al-Suyuty’s Itqaan, Page 59](/appendices/app24_insert1.png)
>
> “‘Ali was asked: ‘Why are you staying home?’ He said, ‘Something has been added to the Quran, and I have pledged never to put on my street clothes, except for the prayer, until the Quran is restored.’”
>
> [Translation — Insert 1]

## The Horrendous Consequences

The horrendous dimensions of this crime can be realized once we look at the consequences:

1. ‘Uthman was assassinated, and ‘Ali was installed as the fourth Khalifa.
2. A 50-year war erupted between the new Khalifa and his supporters on one side, and the Mohammedan distorters of the Quran on the other side.
3. ‘Ali was martyred, and eventually his family, the prophet Muhammad’s family, except for some women and children, were killed.
4. The disaster culminated in the infamous Battle of Karbala, where ‘Ali’s son, Hussein, and his family were massacred.
5. The Muslims were deprived of the pure, unaltered, Quran for 1400 years.

The distorters of the Quran finally won the war, and the “official” history that came to us represented the victors’ point of view. This apparent victory for God’s enemies was, of course, in accordance with God’s will. In just two decades after the Prophet’s death, the idol worshipers who were defeated by the Prophet in the conquest of Mecca (632 AD) reverted to idolatry. Ironically, this time around their idol was the Prophet himself. Such idol worshipers obviously did not deserve to possess the pure Quran. Hence the blessed martyrdom of the true believers who tried to restore the Quran, and the apparent victory for the distorters of God’s word.

The first peace time ruler after this lengthy and disastrous war was Marwan Ibn Al Hakam (died 65 AH/684 AD). One of the first duties he performed was to destroy the original Quran, the one that was so scrupulously written by the Prophet’s own hand, “fearing it might become the cause of NEW disputes” [see *‘ULUM AL-QURAN*, by Ahmad von Denffer, Islamic Foundation, Leicester, United Kingdom, 1983, Page 56.]. The question an intelligent person must ask is: “If the original Quran were identical to the Quran in circulation at that time, why did Marwan Ibn Al-Hakam have to destroy it?!”

Upon examining the oldest Islamic references, we realize that the false injections, 9:128-129, were always suspect. For example, we read in Bukhary’s famous Hadith, and Al-Suyuty’s famous Itqaan, that every single verse in the Quran was verified by a multiplicity of witnesses “except Verses 128 and 129 of Sura 9; they were found only with Khuzeimah Ibn Thaabet Al-Ansaary.” When some people questioned this improper exception, someone came up with a Hadith stating that “the testimony of Khuzeimah equals the testimony of two men!!!”

Strangely, the false injections 9:128-129 are labeled in the traditional Quran printings as “Meccan” [see Insert 2].

> ![The Title Figure of Sura 9 from a standard Quran](/appendices/app24_insert2.png)
>
> The Title Figure of Sura 9 from a standard Quran, showing that this sura is Medinan, “except for the last two verses; they are Meccan”!!! [Insert 2]

How could these ‘Meccan’ verses be found with Khuzeimah, a late ‘Medinan’ Muslim?! How could a Medinan sura contain Meccan verses, when the universal convention has been to label as ‘Medinan’ all revelations after the Prophet’s Hijerah from Mecca??!! Despite these discrepancies, plus many more glaring contradictions associated with Verses 9:128-129, no one dared to question their authenticity. The discovery of the Quran’s mathematical code in 1974, however, ushered in a new era where the authenticity of every element in the Quran is proven ([Appendix 1](/appendices/1)).

As it turns out, the injection of the two false Verses 9:128-129 resulted in: (1) demonstrating the major function of the Quran’s mathematical system, and (2) producing an awesome miracle in its own right, and (3) distinguishing the true believers from the hypocrites (they uphold traditions).

The translation of the two false verses is shown in Insert 3:

> The Two False Verses (9:128-129) — Translation
>
> “A messenger has come to you from among you who wants no hardship to afflict you, and cares about you, and is compassionate towards the believers, merciful. If they turn away, then say, ‘Sufficient for me is God, there is no god except He. I put my trust in Him. He is the Lord with the great throne.’”
>
> [Insert 3]

## The Physical Evidence

**[1]** The first violation of the Quran’s code by Verses 9:128-129 appeared when the count of the word “God” (Allah) in the Quran was found to be 2699, which is not a multiple of 19, unless we remove one. The count of the word “God” is shown at the bottom of each page in this translation. The total shown at the end of the Quran is 2698, 19×142, because the false injections 9:128-129 have been removed.

**[2]** The sum of all the verse numbers where the word “God” occurs is 118123, or 19×6217. This total is obtained by adding the numbers of verses wherever the word “God” is found. If the false Verse 9:129 is included, this phenomenon disappears.

**[3]** As shown at the end of Sura 9 in this translation, the total occurrence of the word “God” to the end of Sura 9 is 1273, 19×67. If the false injections 9:128-129 were included, the total would have become 1274, not a multiple of 19.

**[4]** The occurrence of the word “God” from the first Quranic initial (“A.L.M.” of 2:1) to the last initial (“N.” of 68:1) totals 2641, or 19×139. Since it is easier to list the suras outside the initialed section of the Quran, Table 1 shows the 57 occurrences of the word “God” in that section. Subtracting 57 from the total occurrence of the word “God” gives us 2698 − 57 = 2641 = 19×139, from the first initial to the last initial. If the human injections 9:128 and 129 were included, the count of the word “God” in the initialed section would have become 2642, not a multiple of 19.

**Table 1: Occurrence of the word “God” outside the initialed section**

| Sura No. | No. of Occurrences | Sura No. | No. of Occurrences |
| --- | --- | --- | --- |
| 1 | 2 | 84 | 1 |
| 69 | 1 | 85 | 3 |
| 70 | 1 | 87 | 1 |
| 71 | 7 | 88 | 1 |
| 72 | 10 | 91 | 2 |
| 73 | 7 | 95 | 1 |
| 74 | 3 | 96 | 1 |
| 76 | 5 | 98 | 3 |
| 79 | 1 | 104 | 1 |
| 81 | 1 | 110 | 2 |
| 82 | 1 | 112 | 2 |
|   |   | Total = | 57 = 19×3 |

**[5]** Sura 9 is an un-initialed sura, and if we look at the 85 un-initialed suras, we find that the word “God” occurs in 57 of these suras, 19×3. The total number of verses in the suras where the word “God” is found is 1045, 19×55. If 9:128-129 were included, the verses containing the word “God” would increase by 1.

**[6]** The word “God” from the missing Basmalah (Sura 9) to the extra Basmalah (Sura 27) occurs in 513 verses, 19×27, within 19 suras (Table 2). If the false Verses 9:128-129 were included, the number of verses containing the word “God” would have become 514, and this phenomenon would have disappeared.

**Table 2: The word “God” from the missing Basmalah to the extra Basmalah**

| \# | Sura No. | No. of Verses with “God” |
| --- | --- | --- |
| 1 | 9 | 100 |
| 2 | 10 | 49 |
| 3 | 11 | 33 |
| 4 | 12 | 34 |
| 5 | 13 | 23 |
| 6 | 14 | 28 |
| 7 | 15 | 2 |
| 8 | 16 | 64 |
| 9 | 17 | 10 |
| 10 | 18 | 14 |
| 11 | 19 | 8 |
| 12 | 20 | 6 |
| 13 | 21 | 5 |
| 14 | 22 | 50 |
| 15 | 23 | 12 |
| 16 | 24 | 50 |
| 17 | 25 | 6 |
| 18 | 26 | 13 |
| 19 | 27 | 6 |
| 19 | 342 = 19×18 | 513 = 19×27 |

No. of suras = 19, Total of sura numbers = 342 = 19×18, Total of verses = 513 = 19×27

**[7]** The word “Elaah” which means “god” occurs in Verses 9:129. The total occurrence of this word in the Quran is 95, 19×5. The inclusion of 9:128-129 causes this word to increase by 1, to 96.

**[8]** The INDEX TO THE WORDS OF THE QURAN, lists 116 “Rasool” (Messenger) words. One of these words is in 9:128. By removing this false verse, 115 “Rasool” words remain. Another “Rasool” word which must be excluded from counting is in 12:50, since it refers to the “messenger of Pharaoh,” not the messenger of God. Thus, the total occurrence of “Rasool” of God is 114, 19×6.

**[9]** Another important word that occurs in the false Verses 9:128-129 is the word “Raheem” (Merciful). This word is used in the Quran exclusively as a name of God, and its total count is 114, 19×6, after removing the word “Raheem” of 9:128, which refers to the prophet. According to 7:188, 10:49, and 72:21 the Prophet did not possess any power of mercy.

**[10]** The INDEX lists 22 occurrences of the word “‘Arsh” (Throne). After removing the false injection 9:129, and the “‘Arsh” of Joseph which occurs in 12:100, and the “‘Arsh” of the Queen of Sheba (27:23), we end up with 19 “‘Arsh” words. This proves that the word “‘Arsh” of 9:129 does not belong in the Quran.

**[11]** The Quranic command “Qul” (Say) occurs in the Quran 332 times. Also, the word “Qaaloo” (They said) occurs the same number of times, 332. Since the false Verse 9:129 contains the word “Qul” (Say), its inclusion would have destroyed this typical Quranic phenomenon.

**[12]** The Quran contains 6234 numbered verses and 112 un-numbered verses (Basmalahs). Thus, the total number of verses in the Quran is 6346, 19×334. The false Verses 9:128-129 violate this important criterion of the Quran’s code.

**[13]** In addition to violating the numbers of words as listed above, 9:128-129 violate the Quran’s mathematical structure. When we add the number of verses in each sura, plus the sum of verse numbers (1+2+3+...+n, where n=number of verses), plus the number of each sura, the cumulative total for the whole Quran comes to 346199, or 19×19×959. This phenomenon confirms the authenticity of every verse in the Quran, while excluding 9:128-129. Table 3 is an abbreviated illustration of the calculations of Item 13. This phenomenon is impossible if the false Verses 9:128-129 are included.

**Table 3: Mathematical coding of the Quran’s suras & verses, based on “19”**

| Sura No. | No. of Verses | Sum of Verse #’s | Total |
| --- | --- | --- | --- |
| 1 | 7 | 28 | 36 |
| 2 | 286 | 41041 | 41329 |
| – | – | – | – |
| 9 | 127 | 8128 | 8264 |
| – | – | – | – |
| 114 | 6 | 21 | 141 |
| 6555 | 6234 | 333410 | 346199 = 19×19×959 |

**[14]** When we carry out the same calculations as in Item 13 above, but for the 85 un-initialed suras only, which include Sura 9, the cumulative total is also a multiple of 19. The cumulative total for all un-initialed suras is 156066, or 19×8214. This result depends on the fact that Sura 9 consists of 127 verses, not 129. The data are shown in Table 4. The false verses would have destroyed this criterion.

**Table 4: Mathematical coding of the Quran’s 85 un-initialed suras**

| Sura No. | No. of Verses | Sum of Verse #’s | Total |
| --- | --- | --- | --- |
| 1 | 7 | 28 | 36 |
| 4 | 176 | 15576 | 15756 |
| – | – | – | – |
| 9 | 127 | 8128 | 8264 |
| – | – | – | – |
| 114 | 6 | 21 | 141 |
|   |   | Total = | 156066 = 19×8214 |

**[15]** By adding the sura numbers of all un-initialed suras (85 suras), plus their number of verses, from the beginning of the Quran to the end of Sura 9 we get 703, 19×37. The detailed data are shown in Table 5. This phenomenon depends on the fact that Sura 9 consists of 127 verses.

**Table 5: Un-initialed suras and their verses from the beginning to Sura 9**

| Sura No. | \# Verses | Total |
| --- | --- | --- |
| 1 | 7 | 8 |
| 4 | 176 | 180 |
| 5 | 120 | 125 |
| 6 | 165 | 171 |
| 8 | 75 | 83 |
| 9 | 127 | 136 |
|   | Total = | 703 = 19×37 |

**[16]** By adding the sura number of the un-initialed suras, plus the number of verses, plus the sum of verse numbers from the missing Basmalah (9:1) to the end of the Quran, the grand total comes to 116090, or 19×6110. These data are in Table 6. If Verses 9:128-129 are included, the number of verses for Sura 9 becomes 129, and the grand total becomes 116349, not a multiple of 19.

**Table 6: The un-initialed suras & their verses from missing Basmalah (Sura 9) to the end of the Quran**

| Sura No. | No. of Verses | Sum of Verse #’s | Total |
| --- | --- | --- | --- |
| 9 | 127 | 8128 | 8264 |
| 16 | 128 | 8256 | 8400 |
| – | – | – | – |
| 113 | 5 | 15 | 133 |
| 114 | 6 | 21 | 141 |
|   |   | Total = | 116090 = 19×6110 |

**[17]** When the same calculations of Item 16 are done for all the verses from the missing Basmalah of Sura 9 to the extra Basmalah of Sura 27, the grand total comes to 119966, or 19×6314. This phenomenon would be destroyed, and the total would no longer be divisible by 19, if the number of verses in Sura 9 were 129. Since this phenomenon is also related to the absence of Basmalah from Sura 9, it is explained and the detailed data are given in table form in [Appendix 29](/appendices/29).

**[18]** When the same calculations of Items 16 and 17 are carried out from the missing Basmalah (9:1) to the verse where the number 19 is mentioned (74:30), we find that the grand total comes to 207670, or 19×10930 (Table 7). Sura 9 must consist of 127 verses.

**Table 7: The suras and verses from the missing Basmalah to 74:30**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 9 | 127 | 8128 | 8264 |
| 10 | 109 | 5995 | 6114 |
| – | – | – | – |
| 73 | 20 | 210 | 303 |
| 74 | 30 | 465 | 569 |
| 2739 | 4288 | 200643 | 207670 = 19×10930 |

**[19]** Sura 9 consists of 127 verses. The digits of 127 add up to 1+2+7 = 10. Let us look at all the verses whose digits add up to 10, from the missing Basmalah of Sura 9, to the extra Basmalah of Sura 27. If Sura 9 consisted of 129 verses, the grand total would be 2472, instead of 2470 (19×130); 2472 is not a multiple of 19, and this phenomenon would have disappeared. The data are in Table 8.

**Table 8: The verses whose digits add up to 10 from 9:1 to 27:29**

| Sura No. | No. of Verses | How many add up to 10 | Total |
| --- | --- | --- | --- |
| 9 | 127 | 12 | 148 |
| 10 | 109 | 10 | 129 |
| 11 | 123 | 11 | 145 |
| 12 | 111 | 10 | 133 |
| 13 | 43 | 3 | 59 |
| 14 | 52 | 4 | 70 |
| 15 | 99 | 9 | 123 |
| 16 | 128 | 12 | 156 |
| 17 | 111 | 10 | 138 |
| 18 | 110 | 10 | 138 |
| 19 | 98 | 9 | 126 |
| 20 | 135 | 12 | 167 |
| 21 | 112 | 10 | 143 |
| 22 | 78 | 7 | 107 |
| 23 | 118 | 11 | 152 |
| 24 | 64 | 6 | 94 |
| 25 | 77 | 7 | 109 |
| 26 | 227 | 22 | 275 |
| 27 | 29 | 2 | 58 |
| 342 = 19×18 | 1951 | 177 | 2470 = 19×130 |

342 = 19×18 & 2470 = 19×130

**[20]** The falsifiers wanted us to believe that Sura 9 consists of 129 verses. The number 129 ends with the digit “9.” Let us look at the first sura and the last sura whose number of verses ends with the digit “9.” These are Sura 10 and Sura 104. By adding the sura number, plus the number of verses, plus the sum of verse numbers, from Sura 10 to Sura 104, we get a grand total that equals 23655, or 19×1245. The details are shown in Table 9. The inclusion of Sura 9 with the wrong number of verses, 129, would have altered both the sum of verse numbers and the cumulative total — the sum of verse numbers would have become 627+129=756, and the cumulative total would not be 23655 — and the Quran’s code would have been violated (Table 9).

**Table 9: All the suras whose number of verses ends with “9”**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 10 | 109 | 5995 | 6114 |
| 15 | 99 | 4950 | 5064 |
| 29 | 69 | 2415 | 2513 |
| 43 | 89 | 4005 | 4137 |
| 44 | 59 | 1770 | 1873 |
| 48 | 29 | 435 | 512 |
| 52 | 49 | 1225 | 1326 |
| 57 | 29 | 435 | 521 |
| 81 | 29 | 435 | 545 |
| 82 | 19 | 190 | 291 |
| 87 | 19 | 190 | 296 |
| 96 | 19 | 190 | 305 |
| 104 | 9 | 45 | 158 |
| 748 | 627 | 22280 | 23655 = 19×1245 |

**[21]** The false injection consisted of Verses 128 and 129 at the end of Sura 9. If we look at the numbers 128 and 129, we see two 1’s, two 2’s, one 8, and one 9. Now let us look at all the verses in the Quran, and count all the 1’s we see. This means the 1’s we see in verses 1, 10, 11, 12, 13... 21, 31, and so on. The total count of the 1’s is 2546 (19×134), provided the correct number of verses in Sura 9, 127, is used. If 128 and 129 are included, the grand total becomes 2548, which is not a multiple of 19 (Table 11).

**Table 10: Counting all the 1’s in the 85 un-initialed suras**

| Sura | Verse | \# of 1’s |
| --- | --- | --- |
| 1 | 7 | 1 |
| 4 | 176 | 115 |
| – | – | – |
| 9 | 127 | 61 |
| – | – | – |
| 113 | 5 | 1 |
| 114 | 6 | 1 |
|   | Total = | 1406 = 19×74 |

**Table 11: Counting the digits that make up 128 and 129 in the whole Quran**

| Sura No. | No. of 1’s | No. of 2’s | No. of 8’s | No. of 9’s | Total |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1 | 0 | 0 | 2 |
| 2 | 159 | 146 | 55 | 48 | 408 |
| – | – | – | – | – | – |
| 9 | 61 | 31 | 22 | 22 | 136 |
| 10 | 31 | 21 | 21 | 21 | 94 |
| – | – | – | – | – | – |
| 114 | 1 | 1 | 0 | 0 | 2 |
|   | 2546 | 1641 | 908 | 833 | 5928 |
|   | (19×134) |   |   |   | (19×312) |

**[22]** Since Sura 9 is an un-initialed sura, let us look at all the verse numbers in the 85 un-initialed suras and count all the 1’s we see. As shown in Table 10, the total count of the digit “1” in the un-initialed suras is 1406, or 19×74. Obviously, if Sura 9 consisted of 129 verses, we would see two additional 1’s, from 128 and 129, and the code would be violated.

**[23]** Following the same process explained in Items 22 and 23 for the digit “1,” let us count all the 2’s, 8’s and 9’s in all the verse numbers of the whole Quran. As shown in Table 11, the total count of all the 2’s, 8’s, and 9’s is 3382, or 19×178. This makes the grand total of all the 1’s, 2’s, 8’s, and 9’s 2546+3382 = 5928, 19×312.

In this remarkable phenomenon, we considered every single verse in the Quran, and examined the individual digits that make up Verses 128 and 129. Since 128 and 129 contain 6 digits, the inclusion of these human injections causes the total count of these digits in the whole Quran to be 5928+6 = 5934, not a multiple of 19.

**[24]** The total count of all the digits (1 through 9) in all the verse numbers of the 85 un-initialed suras, including Sura 9 with 127 verses, is 27075, or 19×19×75.

**[25]** Adding up the digits of the Quran’s suras and verses produces a multiple of 19, provided the correct number of verses for Sura 9, 127, is taken. To do this, you make a list of the Quran’s 114 suras and the number of verses in each sura. Add the digits of every sura number. The sum of digits of 10=1, 11=2, 12=3, 99=18, and so on. The total for all the suras is 975. The same thing is done for the numbers of verses in every sura. For example, Sura 2 consists of 286 verses. The digits of 286 add up to 2+8+6=16. For Sura 9, the digits of its number of verses add up to 1+2+7=10. The total for all 114 suras is 906. Thus, the grand total for the sum of digits of all the suras and verses is 975+906 = 1881 = 19×99. Naturally, this observation would not be possible if Sura 9 consisted of 129 verses. Table 12 is abbreviated to illustrate the calculations.

**Table 12: Sum of digits of all suras & verse numbers in the whole Quran**

| Sura No. | No. of Verses | Sum of Digits of Suras | Sum of Digits of Verses |
| --- | --- | --- | --- |
| 1 | 7 | 1 | 7 |
| 2 | 286 | 2 | 16 |
| 3 | 200 | 3 | 2 |
| – | – | – | – |
| 9 | 127 | 9 | 10 |
| – | – | – | – |
| 114 | 6 | 6 | 6 |
|   | Total = | 975 | 906 |

975 + 906 = 1881 = 19×99

**[26]** Miraculously, if we calculate the sum of digits for every sura in the Quran, and multiply the sum for each sura by the sum of digits of its number of verses, instead of adding, we still end up with a grand total that is a multiple of 19. For example, Sura 2 has 286 verses. The sum of digits of 2+8+6=16. So you multiply 2 by 16, and you get 32, instead of adding 2+16 as we did in Item 26. This is done for every sura in the Quran. The grand total for all the suras is 7771, or 19×409. Once again, every single verse in the Quran is confirmed, while the false verses are utterly rejected. See Table 13.

**Table 13: Multiplication of the sum of digits of the Quran’s suras and verses**

| Sura No. | No. of Verses | Σ Digits (Sura) | Σ Digits (Verses) | Product |
| --- | --- | --- | --- | --- |
| 1 | 7 | 1 | 7 | 7 |
| 2 | 286 | 2 | 16 | 32 |
| 3 | 200 | 3 | 2 | 6 |
| – | – | – | – | – |
| 9 | 127 | 9 | 10 | 90 |
| – | – | – | – | – |
| 114 | 6 | 6 | 6 | 36 |
|   |   | 975 | 906 | 7771 = 19×409 |

975 + 906 = 1881 = 19×99

**[27]** Another truly awesome phenomenon: Sura 9 is an odd-numbered sura, and if we carry out the calculations described above for the odd-numbered suras only, we find that the total for the suras is 513 (19×27), the total for the verses is 437 (19×23), and the grand total for both is 513+437 = 950 (19×50). Table 14 illustrates this remarkable phenomenon.

**Table 14: Same data as in Table 12, but only for the odd-numbered suras**

| Sura No. | No. of Verses | Σ Digits (Sura) | Σ Digits (Verses) | Total |
| --- | --- | --- | --- | --- |
| 1 | 7 | 1 | 7 | 8 |
| 3 | 200 | 3 | 2 | 5 |
| – | – | – | – | – |
| 9 | 127 | 9 | 10 | 19 |
| – | – | – | – | – |
| 113 | 5 | 5 | 5 | 10 |
|   |   | 513 | 437 | 950 |
|   |   | (19×27) | (19×23) | (19×50) |

**[28]** Let us take all the suras that consist of 127 verses or less. There are 105 such suras. The sum of the sura numbers of these 105 suras, plus the sum of their verse numbers is 10963, or 19×577. Sura 9 is the only sura that has 127 verses. See Table 15. If Sura 9 did consist of 129 verses, it would not be included in this list of suras, the total would be 10827 (10963-136), this phenomenon would have disappeared, and the Quran’s code would have been violated.

**Table 15: Mathematical coding of all suras consisting of 127 verses or less**

| Sura No. | No. of Verses | Total |
| --- | --- | --- |
| 1 | 7 | 8 |
| 5 | 120 | 125 |
| 8 | 75 | 83 |
| 9 | 127 | 136 |
| – | – | – |
| 113 | 5 | 118 |
| 114 | 6 | 120 |
| 6434 | 4529 | 10963 = 19×577 |

**[29]** Since Sura 9 is odd-numbered, and its number of verses is also odd, let us look at all the odd-numbered suras whose number of verses is also odd. This gives us 27 suras: 1, 9, 11, 13, 15, 17, 25, 27, 29, 33, 35, 39, 43, 45, 57, 63, 81, 87, 91, 93, 97, 101, 103, 105, 107, 111, and 113. They consist of 7, 127, 123, 43, 99, 111, 77, 93, 69, 73, 45, 75, 89, 37, 29, 11, 29, 19, 15, 11, 5, 11, 3, 5, 7, 5, and 5 verses, respectively. The sum of these sura numbers, plus their sum of verse numbers is 2774, 19×146. If we take the wrong number of verses for Sura 9, i.e., 129, this miracle disappears.

**[30]** The correct number of verses in Sura 9 is 127, and this is a prime number — it is not divisible by any number except 1, and itself. Let us look at all the suras whose number of verses is a prime number. These are Suras 1, 9, 13, 33, 43, 45, 57, 63, 81, 87, 93, 97, 101, 103, 105, 107, 111, and 113. The numbers of verses in these suras are 7, 127, 43, 73, 89, 37, 29, 11, 29, 19, 11, 5, 11, 3, 5, 7, 5, and 5, respectively. If you add the digits of these suras, you get 137, while the digits of the verses add up to 129. This makes the grand total of all the digits 137+129 = 266 = 19×14.

**[31]** The distorters added two false verses to Sura 9, and this caused the sura to have 129 verses. Since 129 consists of 3 digits, and is divisible by 3, let us look at the suras whose number of verses is divisible by 3, and consists of 3 digits. The total of these sura numbers is 71, and the total number of verses is 765. This produces a grand total of 71 + 765 = 836, or 19×44. The data are shown in Table 16.

**Table 16: All suras whose number of verses is 3 digit, and is divisible by 3**

| Sura No. | \# of Verses | Total |
| --- | --- | --- |
| 5 | 120 | 125 |
| 6 | 165 | 171 |
| 11 | 123 | 134 |
| 12 | 111 | 123 |
| 17 | 111 | 128 |
| 20 | 135 | 155 |
| 71 | 765 | 836 = 19×44 |

If Sura 9 had 129 verses, it would have been included in this table, and would have destroyed this phenomenon.

**[32]** If Sura 9 consisted of 129 verses, as the falsifiers would like us to believe, then let us look at all the suras which consist of 129 verses or more. There are 8 such suras. Their data are shown Table 17. If Sura 9 consisted of 129 verses, the total number of verses would have been 1577 + 129 = 1706, not a multiple of 19.

**Table 17: All the suras that consist of 129 verses or more**

| Sura No. | No. of Verses |
| --- | --- |
| 2 | 286 |
| 3 | 200 |
| 4 | 176 |
| 6 | 165 |
| 7 | 206 |
| 20 | 135 |
| 26 | 227 |
| 37 | 182 |
| Total = | 1577 = 19×83 |

**[33]** The numbers 127, 128 and 129 have two digits in common, “1” and “2.” Let us consider all the suras whose number of verses contains the digits 1 and 2. By adding the sura numbers plus the numbers of verses, we get 1159, 19×61. See Table 18. If Sura 9 consisted of 129 verses, the total would have become 1159+2 = 1161, not a multiple of 19.

**Table 18: Suras whose final verse have the numerals “1” and “2” in common with the verses in question (127, 128, and 129)**

| Sura No. | No. of Verses | Total |
| --- | --- | --- |
| 5 | 120 | 125 |
| 9 | 127 | 136 |
| 11 | 123 | 134 |
| 16 | 128 | 144 |
| 21 | 112 | 133 |
| 37 | 182 | 219 |
| 65 | 12 | 77 |
| 66 | 12 | 78 |
| 92 | 21 | 113 |
| 322 | 837 | 1159 = 19×61 |

**[34]** Sura 9 is a single-digit sura whose number of verses contains the digits 1 and 2. There is only one other sura that possesses these traits: Sura 5 is a single-digit sura, and it consists of 120 verses. As shown in Table 19, the number of verses in these two suras is 120+127 = 247 = 19×13. If Sura 9 consisted of 129 verses, the total would have been 247+2 = 249, not a multiple of 19.

**Table 19: The only suras whose number is a single digit, and the number of verses contains the numerals “1” and “2”**

| Sura Number | No. of Verses |
| --- | --- |
| 5 | 120 |
| 9 | 127 |
| Total = | 247 = 19×13 |

**[35]** We looked at all the suras whose number of verses contains “1” and “2.” Let us now look at all the suras whose number of verses begins with the digit “1.” There are 30 suras that possess this quality: Suras 4, 5, 6, 9, 10, 11, 12, 16, 17, 18, 20, 21, 23, 37, 49, 60, 61, 62, 63, 64, 65, 66, 82, 86, 87, 91, 93, 96, 100, and 101. Their numbers of verses are 176, 120, 165, 127, 109, 123, 111, 128, 111, 110, 135, 112, 118, 182, 18, 13, 14, 11, 11, 18, 12, 12, 19, 17, 19, 15, 11, 19, 11, and 11. The sum of verse numbers (1+2+3+...+n) for these 30 suras is 126122, or 19×6638. If Sura 9 consisted of 129 verses, the sum of their verse numbers would have been 126122 + 128 + 129 = 126379, and this total is not a multiple of 19.

**[36]** Sura 9 consists of 127 verses, and 9+1+2+7 equals 19. Let us look at all the suras whose digits of sura and verses add up to 19. There are 10 suras that meet this specification, and the total of their sura numbers and numbers of verses is 1216, or 19×64. The data are shown in Table 20.

**Table 20: All the suras where the digits of sura number and number of verses add up to 19**

| Sura No. | No. of Verses | Total |
| --- | --- | --- |
| 9 | 127 | 136 |
| 22 | 78 | 100 |
| 26 | 227 | 253 |
| 45 | 37 | 82 |
| 54 | 55 | 109 |
| 64 | 18 | 82 |
| 72 | 28 | 100 |
| 77 | 50 | 127 |
| 78 | 40 | 118 |
| 84 | 25 | 109 |
| 531 | 685 | 1216 = 19×64 |

Mr. Gatut Adisoma of Masjid Tucson made the following two discoveries.

**[37]** Sura 9 consists of 127 verses, and (9) plus (1+2+7) add up to 19. There are three other suras in the whole Quran whose sura digits add up to 9 and the digits of their number of verses add up to 10. These are suras 9, 45, 54, and 72. They consist of 127, 37, 55, and 28 verses, respectively. The total number of verses in these three suras is 247, 19×13. If Sura 9 consisted of 129 verses, it would not be included in this table to begin with. See Table 21.

**Table 21: All the suras where the digits of sura number add up to 9 and the digits of number of verses add up to 10**

| Sura No. | No. of Verses |
| --- | --- |
| 9 | 127 |
| 45 | 37 |
| 54 | 55 |
| 72 | 28 |
| Total = | 247 = 19×13 |

**[38]** If Sura 9 consisted of 129 verses as the distorters claimed, then there is only one other sura in the whole Quran whose sura digits add up to 9, and its number of verses’ digits add up to 12, namely Sura 27. As shown in Table 22, this combination, with 129 verses for Sura 9, does not conform with the Quran’s code.

**Table 22: The suras where the digits of sura number add up to 9, and the digits of number of verses add up to 12, assuming that Sura 9 is 129 verses**

| Sura No. | No. of Verses |
| --- | --- |
| 9 | 129 |
| 27 | 93 |
| Total = | 222 |

(not a multiple of 19)

**[39]** Let us assume for awhile that Sura 9 consists of 129 verses. Since the number 129 ends with the digit “9,” let us look at all the suras where the number of verses ends with the digit “9.” We find 13 suras in the Quran whose number of verses ends with the digit “9.” They are Suras 10, 15, 29, 43, 44, 48, 52, 57, 81, 82, 87, 96, and 104. Their numbers of verses are 109, 99, 69, 89, 59, 29, 49, 29, 29, 19, 19, 19, and 9, respectively. As illustrated by Table 23, many conform with the Quran’s code only if Sura 9 is excluded; it does not consist of 129 verses. Without Sura 9, the total number of verses in these 13 suras is 627, 19×33. Additionally, the sura number, plus the number of verses, plus the sum the sum of verse numbers, add up to 23655, or 19×1245. These phenomena would have disappeared if Sura 9 consisted of 129 verses.

**Table 23: All suras whose number of verses end with the digit “9”**

| Sura No. | No. of Verses | Sum of Verse #’s | Total |
| --- | --- | --- | --- |
| 10 | 109 | 5995 | 6114 |
| 15 | 99 | 4950 | 5064 |
| 29 | 69 | 2415 | 2513 |
| 43 | 89 | 4005 | 4137 |
| 44 | 59 | 1770 | 1873 |
| 48 | 29 | 435 | 512 |
| 52 | 49 | 1225 | 1326 |
| 57 | 29 | 435 | 521 |
| 81 | 29 | 435 | 545 |
| 82 | 19 | 190 | 291 |
| 87 | 19 | 190 | 296 |
| 96 | 19 | 190 | 305 |
| 104 | 9 | 45 | 158 |
| 748 | 627 = 19×33 | 22280 | 23655 = 19×1245 |

**[40]** Sura 9 is an odd-numbered sura whose number of verses ends with the digit “9.” Let us now look at all the odd-numbered suras whose number of verses ends with “9.” As shown in Table 24, the total of sura number and number of verses in these suras is 646, or 19×34. If Sura 9 had 129 verses, it would have been included in this group, and the total would have been 646+129+9 = 784, which is not a multiple of 19.

**Table 24: Odd numbered suras whose number of verses ends with “9”**

| Sura No. | No. of Verses | Total |
| --- | --- | --- |
| 15 | 99 | 114 |
| 29 | 69 | 98 |
| 43 | 89 | 132 |
| 57 | 29 | 86 |
| 81 | 29 | 110 |
| 87 | 19 | 106 |
| 312 | 334 | 646 = 19×34 |

**[41]** By now, it is incontrovertibly proven that Sura 9 consists of 127 verses. Let us now look at the suras whose number of verses ends with “7.” There are 7 such suras; they are Suras 1, 9, 25, 26, 45, 86, and 107. Their numbers of verses are 7, 127, 77, 227, 37, 17, and 7 verses, respectively. The grand total of sura numbers plus number of verses for these seven suras is 798, 19×42. The details are shown in Table 25. Thus, every sura whose number of verses ends with the digit “7,” including Sura 9, conforms with the code.

**Table 25: The suras whose number of verses ends with the digit “7”**

| Sura No. | No. of Verses | Total |
| --- | --- | --- |
| 1 | 7 | 8 |
| 9 | 127 | 136 |
| 25 | 77 | 102 |
| 26 | 227 | 253 |
| 45 | 37 | 82 |
| 86 | 17 | 103 |
| 107 | 7 | 114 |
| 299 | 499 | 798 = 19×42 |

**[42]** The last two verses of Sura 9 are 126 and 127. Since the falsifiers added two verses, let us look at the last two verses of every sura in the Quran, and count the digit “7,” all of them, among these last two verses. As shown in Table 26, the total number of the digit “7” among the last two verses of every sura in the Quran is 38, 19×2.

**Table 26: The total number of the digit “7” among the last two verses of every sura in the Quran**

| Sura No. | Last 2 Verses | 7’s in Last 2 Verses |
| --- | --- | --- |
| 1 | 6,7 | 1 |
| 2 | 285,286 | 0 |
| 3 | 199,200 | 0 |
| 4 | 175,176 | 2 |
| – | – | – |
| 9 | 126,127 | 1 |
| – | – | – |
| 25 | 76,77 | 3 |
| – | – | – |
| 114 | 5,6 | 0 |
|   | Total = | 38 = 19×2 |

If the last verse in Sura 9 was 129 instead of 127, the number of occurrences of the digit “7” would have been 37, not 38, and this criterion would have been destroyed.

**[43]** Assuming that Sura 9 consists of 129 verses, let us look at all the suras that contain a verse No. 129. This means that we look at all the suras that consist of 129 or more verses. For example, Sura 2 consists of 286 verses. Therefore, it contains a verse that is assigned the number “129.” We then take this verse and add it to all the other verses assigned the number 129 throughout the Quran. Under this assumption, there are 9 suras that contain a verse No. 129. Interestingly, we find that the total of sura numbers of these 9 suras is a multiple of 19 (114), while the total for the nine 129’s can be a multiple of 19 if 2 is deducted from their total. In other words, we are told that one of these 9 suras contains 2 extra verses. The details are in Table 27. When we add 114, plus 1161, and remove 2, we get 1273, or 19×67. Compare this total (1273) with the total reported in the Item 44 below. Of the 9 suras listed in Table 27, which one has the extra 2 verses? The answer is provided in Item 44.

**Table 27: All suras which contain a verse number “129”**

| Sura No. | Verse No. |
| --- | --- |
| 2 | 129 |
| 3 | 129 |
| 4 | 129 |
| 6 | 129 |
| 7 | 129 |
| 9 ? | 129 |
| 20 | 129 |
| 26 | 129 |
| 37 | 129 |
| 114 | 1161 |

114 + 1161 − 2 = 1273 = 19×67

**[44]** To pinpoint the location of these two false verses, let us look at all the suras that contain a verse No. 128, while continuing to assume that Sura 9 consists of 129 verses. This will give us the same list of suras as in Table 27, and also bring in Sura 16 which has precisely 128 verses. As shown in Table 28, Sura 9 stands out in glaring disharmony; it is singled out as the sura that contains the false verses. The total of suras and verses becomes divisible by 19 only if Sura 9 is removed. Note that the divisible total, after removing Sura 9, is 1273, 19×67, which is the same total obtained in Item 43 above after removing 2 verses. This remarkable phenomenon proves that Sura 9 could not contain a verse No. 128.

**Table 28: All suras containing a verse number “128”**

| Sura No. | Verse No. |
| --- | --- |
| 2 | 128 |
| 3 | 128 |
| 4 | 128 |
| 6 | 128 |
| 7 | 128 |
| 9 ? | 128 |
| 16 | 128 |
| 20 | 128 |
| 26 | 128 |
| 37 | 128 |
| 130 | 1280 |

130 + 1280 = 1410 (not a multiple of 19). If we remove Sura 9, with its 128 verses, we get 1410 − 9 − 128 = 1273 = 19×67

**[45]** Sura 9 is an un-initialed sura whose last two verses are 126 and 127. Let us take the 85 un-initialed suras, and add up the numbers of the last two verses in each sura. For example, the last two verses in Sura 1 are 6 and 7. Add 6+7 and you get 13. The next un-initialed sura is Sura 4; its last two verses are 175 and 176. Add 175+176 and you get 351. Do this for all un-initialed suras. The data are in Table 29. Thus, the last two verses of Sura 9 are confirmed to be 126 and 127.

**Table 29: Abbreviated table of the last two verses in the un-initialed suras**

| Sura No. | Last 2 Verses | Total |
| --- | --- | --- |
| 1 | 6+7 | 13 |
| 4 | 175+176 | 351 |
| 5 | 119+120 | 239 |
| – | – | – |
| 9 | 126+127 | 253 |
| – | – | – |
| 114 | 5+6 | 13 |
|   | Total = | 6897 = 19×363 |

**[46]** Let us now take the last two verses in every sura in the Quran, initialed and un-initialed, and add the digits of the last two verses in each sura (Table 30). It is readily obvious that the last two verses of every sura in the Quran are divinely fixed, and divinely guarded through this intricate mathematical code. The last two verses of Sura 9 are confirmed to be 126 & 127, not 128 & 129.

**Table 30: Sum of digits of the last two verses of every sura in the Quran**

| Sura No. | Last 2 Verses | Sum of the Digits |
| --- | --- | --- |
| 1 | 6,7 | 6 + 7 |
| 2 | 285,286 | 2+8+5+2+8+6 |
| 3 | 199,200 | 1+9+9+2+0+0 |
| – | – | – |
| 9 | 126,127 | 1+2+6+1+2+7 |
| – | – | – |
| 113 | 4,5 | 4 + 5 |
| 114 | 5,6 | 5 + 6 |
|   | Total = | 1824 = 19×96 |

**[47]** Sura 9 consists of 127 verses, and 127 consists of 3 digits. Let us look at all the suras whose number of verses consists of 3 digits; these are suras 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 16, 17, 18, 20, 21, 23, 26, and 37. Their verse numbers are 286, 200, 176, 120, 165, 206, 127, 109, 123, 111, 128, 111, 110, 135, 112, 118, 227, and 182, respectively. By taking the last digit in each number of verses, and adding up these digits, we get 6+0+6+0+5+6+7+9+3+1+8+1+0+5+2+8+7+2 = 76 = 19×4. If Sura 9 consisted of 129 verses, the last digit in its number of verses would be 9 instead of 7, and the total of last digits would be 78 instead of 76, and this phenomenon would disappear.

**[48]** Let us look at the list of suras shown in Item 47 above. Since the number of verses in Sura 9 is an odd number, let us now consider the odd-numbered verse numbers. There are 8 suras with a 3-digit, odd number of verses: Suras 6, 9, 10, 11, 12, 17, 20, and 26. Their numbers of verses are 165, 127, 109, 123, 111, 111, 135, & 227. The last digits in these numbers of verses are 5, 7, 9, 3, 1, 1, 5, and 7, respectively, and the sum of these digits is 38, or 19×2. Obviously, if Sura 9 consisted of 129 verses, its last digit would be 9, not 7, and the sum of the last digits would be 40, not a multiple of 19. The detailed data are shown in Table 31. Thus, we are getting more and more specific, as we zoom in on the last digit in the number of verses.

**Table 31: All suras whose number of verses is odd, and consists of 3 digits**

| Sura No. | No. of Verses | Last Digit |
| --- | --- | --- |
| 6 | 165 | 5 |
| 9 | 127 | 7 |
| 10 | 109 | 9 |
| 11 | 123 | 3 |
| 12 | 111 | 1 |
| 17 | 111 | 1 |
| 20 | 135 | 5 |
| 26 | 227 | 7 |
|   | Total = | 38 = 19×2 |

**[49]** Let us continue to work with the same group of suras of Items 47 and 48. Since Sura 9 is an odd-numbered sura, let us now remove all the even-numbered suras from the list of suras shown in Item 47. Now we have odd-numbered suras, with odd-numbered verses. There are only three such suras in the whole Quran: 9, 11, and 17. Their numbers of verses are 127, 123, and 111 (Table 32). If Sura 9 consisted of 129 verses, this remarkable phenomenon would have been destroyed.

**Table 32: Odd numbered suras whose number of verses is odd and consists of 3 digits**

| Sura No. | No. of Verses |
| --- | --- |
| 9 | 127 |
| 11 | 123 |
| 17 | 111 |
| Total = | 361 = 19×19 |

**[50]** Let us continue to work with the three suras listed in Item 49. These are all the suras in the Quran whose number is odd (like Sura 9), their number of verses consists of 3 digits (like Sura 9), and their number of verses is also odd (like Sura 9). As shown in Table 32, the verse numbers of these 3 suras are 127, 123, and 111. Just add the individual digits, and you get 1 + 2 + 7 + 1 + 2 + 3 + 1 + 1 + 1 = 19. Obviously, this phenomenon depends on the now proven truth that Sura 9 consists of 127 verses. If Sura 9 consisted of 129 verses, the only suras in the Quran that possess the above stated qualities would have added up to 1+2+9+1+2+3+1+1+1 = 21. In other words, this important component of the Quran’s mathematical code would have disappeared.

**[51]** There are three suras (1) whose numbers are odd, (2) their numbers of verses are odd, and (3) the number of verses consists of 3 digits. They are Suras: 9, 11, and 17 (see Items 48 through 50 for the flow of this point). Just add the individual digits that make up the three sura numbers, and you get 9+1+1+1+7=19.

**[52]** The number 129 is divisible by 3. If Sura 9 consisted of 129 verses as the distorters claimed, then it would be (1) an odd-numbered sura that (2) consists of a 3-digit number of verses, (3) the number of verses is odd, and (4) the number of verses is divisible by 3. There are only two suras in the whole Quran that possess these qualities: Sura 11 with 123 verses, and Sura 17 with 111 verses. The sum of digits of both sura numbers and the numbers of verses comes to 1+1+1+2+3+1+7+1+1+1 = 19. This can be observed only if Sura 9 consists of 127 verses.

**[53]** Sura 9 is (1) odd-numbered, (2) its number of verses is odd, (3) its number of verses ends with the digit “7,” (4) its number of verses is a prime number, and (5) the sura number is divisible by 3 & 9. The only two suras that possess these qualities are: Sura 9 (127 verses), and Sura 45 (37 verses). Just add the digits you see:

> 9+1+2+7=19 & 4+5+3+7=19; Total for both suras = 19+19 = 38.

**[54]** Let us assume that Sura 9 does have 129 verses. In that case we will have only two suras in the whole Quran whose number begins with 9, and their number of verses ends with 9: Sura 9 (129 verses) and Sura 96 (19 verses). As detailed in Table 33, the grand total of sura number, plus the number of verses, plus the sum of verse numbers is 8828, not a multiple of 19.

**Table 33: Suras whose numbers begins with “9” and their number of verses ends with “9”**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 9 | 129? | 8385 | 8523 |
| 96 | 19 | 190 | 305 |
| 105 | 148 | 8575 | 8828 |

(Not a multiple of 19)

Now let us remove the false verses (128 & 129) from Sura 9, and repeat the same calculations. The result of this correction is shown in Table 34. The grand total becomes 8569, 19×451.

**Table 34: Same data as in Table 33, after correcting the number of verses in Sura 9**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 9 | 127 | 8128 | 8264 |
| 96 | 19 | 190 | 305 |
| 105 | 146 | 8318 | 8569 = 19×451 |

**[55]** Let us assume that Sura 9 consists of 129 verses. The total of these digits is 9+1+2+9=21. Let us look at all the suras where the digits of their number of verses add up to 21. There are 7 such suras: 9, 25, 27, 37, 68, 94, and 97. By adding the sura numbers, plus the number of verses in each sura, plus the sum of verse numbers, the grand total comes to 34744, not a multiple of 19 (Table 35).

**Table 35: Suras whose digits of sura numbers and verse numbers add up to 21, assuming that Sura 9 consists of 129 verses**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 9 | 129? | 8385 | 8523 |
| 25 | 77 | 3003 | 3105 |
| 27 | 93 | 4371 | 4491 |
| 37 | 182 | 16653 | 16872 |
| 68 | 52 | 1378 | 1498 |
| 94 | 8 | 36 | 138 |
| 97 | 5 | 15 | 117 |
| 357 | 546 | 33841 | 34744 |

(Not divisible by 19)

Now, let us use the correct number of verses for Sura 9, 127, and repeat the same calculations as in Table 35. This causes the grand total to become 34485, or 19×1815. See Table 36.

**Table 36: Calculations of Table 35, after correcting the verses in Sura 9**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 9 | 127 | 8128 | 8264 |
| 25 | 77 | 3003 | 3105 |
| 27 | 93 | 4371 | 4491 |
| 37 | 182 | 16653 | 16872 |
| 68 | 52 | 1378 | 1498 |
| 94 | 8 | 36 | 138 |
| 97 | 5 | 15 | 117 |
| 357 | 544 | 33584 | 34485 = 19×1815 |

**[56]** For the last time, let us assume that Sura 9 consists of 129 verses. We have here a sura that (1) is an odd numbered sura, (2) its number is divisible by 3, (3) the number of verses, 129, is also divisible by 3, and (4) the number of verses ends with the digit “9.” There is only one sura that possesses these qualities: Sura 15 is divisible by 3, its number of verses is 99, which is divisible by 3 and ends with the digit “9.” If Sura 9 consisted of 129, and we added the sura and verse numbers for these two suras, we would end up with the following results: 9 + 129 + 15 + 99 = 252 — not a multiple of 19.

If we throw away the false number 129, we have one sura in the Quran whose number is odd, and its number of verses is divisible by 3 and ends with the digit 9 — Sura 15. Now we have the following result:

> 15 + 99 = 114 = 19×6.

**[57]** For some time now, we have been dealing with numbers. Let us now look at specific words and letters that occur in the false injections 9:128-129. The last statement in 9:127 describes the disbelievers as “LAA YAFQAHOON” (they do not comprehend). Thus, the last letter in Sura 9 is “N” (Noon). According to the falsifiers, the last verse is 129, and the last letter is “M” (Meem), since the last false word is “AZEEM.” Now let us look at the first letter and the last letter of every sura from the beginning of the Quran to Sura 9, and calculate their gematrical (numerical) values. Table 37 shows that the last true letter in Sura 9 must be “N,” not “M.”

**Table 37: Gematrical value of the first and last letters of every sura from the beginning of the Quran to Sura 9**

| Sura No. | First Letter | Last Letter | Total |
| --- | --- | --- | --- |
| 1 | B = 2 | N = 50 | 52 |
| 2 | A = 1 | N = 50 | 51 |
| 3 | A = 1 | N = 50 | 51 |
| 4 | Y = 10 | M = 40 | 50 |
| 5 | Y = 10 | R = 200 | 210 |
| 6 | A = 1 | M = 40 | 41 |
| 7 | A = 1 | N = 50 | 51 |
| 8 | Y = 10 | M = 40 | 50 |
| 9 | B = 2 | N = 50 | 52 |
|   | 38 | 570 | 608 |
|   | (19×2) | (19×30) | (19×32) |

**[58]** Sister Ihsan Ramadan of Masjid Tucson counted all the suras in the Quran which end with the letter “N” (Noon), the last letter in Sura 9. She found that 43 suras end with the same letter as Sura 9 (N) — suras 1, 2, 3, 7, 9, 10, 11, 12, 15, 16, 21, 23, 26, 27, 28, 29, 30, 32, 36, 37, 38, 39, 40, 43, 44, 46, 49, 51, 58, 61, 62, 63, 66, 67, 68, 70, 77, 81, 83, 84, 95, 107, and 109. Just add the sura numbers + number of suras that end with “N”, and you get:

> 1919\.

Thus, the last letter in Sura 9 is once again confirmed to be “N,” not “M.”

**[59]** Now let us look at the crucial expression “LA ELAAHA ELLA HOO” (There is no god except He). This phrase occurs in the false injection 9:129. This very special expression occurs 29 times in 19 suras (Table 38). By adding the sura numbers of the 19 suras, plus the verse numbers where the phrase “LAA ELAAHA ELLA HOO” occurs, plus the number of occurrences of this crucial phrase, the grand total comes to 2128, or 19×112. This awesome result is dependent on the fact that 9:128-129 do not belong in the Quran. Obviously, if 9:129 were included, the crucial expression “LA ELAAHA ELLA HOO,” the First Pillar of Islam, would not conform with the mathematical code.

**Table 38: List of all occurrences of the crucial phrase: “LAA ELAAHA ELLA HOO” (There is no other god besides Him), after removing 9:129**

| \# | Sura No. | Verses with the key phrase | Frequency of the phrase |
| --- | --- | --- | --- |
| 1\. | 2 | 163,255 | 2 |
| 2\. | 3 | 2,6,18(2x) | 4 |
| 3\. | 4 | 87 | 1 |
| 4\. | 6 | 102,106 | 2 |
| 5\. | 7 | 158 | 1 |
| 6\. | 9 | 31 | 1 |
| 7\. | 11 | 14 | 1 |
| 8\. | 13 | 30 | 1 |
| 9\. | 20 | 8,98 | 2 |
| 10\. | 23 | 116 | 1 |
| 11\. | 27 | 26 | 1 |
| 12\. | 28 | 70,88 | 2 |
| 13\. | 35 | 3 | 1 |
| 14\. | 39 | 6 | 1 |
| 15\. | 40 | 3,62,65 | 3 |
| 16\. | 44 | 8 | 1 |
| 17\. | 59 | 22,23 | 2 |
| 18\. | 64 | 13 | 1 |
| 19\. | 73 | 9 | 1 |
|   | 507 | 1592 | 29 |

507 + 1592 + 29 = 2128 = 19×112

**[60]** The first occurrence of “LA ELAAHA ELLA HOO” is in 2:163, and the last occurrence is in 73:9. If we add the sura number, plus the number of verses, plus the sum of verse numbers from the first occurrence to the last occurrence, the grand total comes to 316502, or 19×16658. Table 39 presents the detailed data. Naturally, if “LAA ELAAHA ELLA HOO” of the false verse 129 were included, this phenomenon would have disappeared.

**Table 39: All suras and verses from the first occurrence to the last occurrence of “LAA ELAAHA ELLA HOO”**

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 2 | 123 (286−163) | 27675 | 27800 |
| 3 | 200 | 20100 | 20303 |
| – | – | – | – |
| 9 | 127 | 8128 | 8264 |
| – | – | – | – |
| 72 | 28 | 406 | 506 |
| 73 | 9 | 45 | 127 |
| 2700 | 5312 | 308490 | 316502 = 19×16658 |

**[61]** The phrase “LAA ELAAHA ELLA HOO” occurs 7 times between the missing Basmalah of Sura 9 and the extra Basmalah of Sura 27, in 9:31, 11:14, 13:30, 20:8, 20:98, 23:116, and 27:26. By adding the numbers of the 7 verses, we get 323, or 19×17. The detailed data are shown in Table 40.

**Table 40: Occurrences of the phrase “LAA ELAAHA ELLA HOO” from the missing Basmalah to the extra Basmalah**

| Sura No. | Verse Numbers With Phrase |
| --- | --- |
| 9 | 31 |
| 11 | 14 |
| 13 | 30 |
| 20 | 8 |
| 20 | 98 |
| 23 | 116 |
| 27 | 26 |
| Total = | 323 = 19×17 |

If 9:129 were part of the Quran, the total in Table 40 would have been: 323 + 129 = 452, not a multiple of 19. God rejects what the hypocrites utter, even if it is the truth (63:1).

## The Ultimate Quranic Miracle

**[62]** Brother Abdullah Arik has discovered what I consider to be the ultimate Quranic miracle. This miraculous phenomenon incontrovertibly authenticates every single verse in the Quran — the number of verses in every sura, and the numbers assigned to every single verse in the Quran — while exposing and rejecting the false injections, 9:128-129. To witness this great phenomenon, see Page [Appendix 1](/appendices/1) (under the heading: Superhuman Numerical Combinations). Putting the number of every verse in the Quran in sequence from the beginning to the end, with the number of verses in each sura ahead of the verse numbers of each sura, the final number consists of 12692 digits (19×668), and the number itself is also a multiple of 19. If the wrong number of verses for Sura 9 was used — 129 instead of 127 — neither the number of digits, nor the number itself would be divisible by 19.

**[63]** Since the subject of this Appendix is Sura 9 and its number of true verses, it is noteworthy that if we write down the number of the sura, 9, followed by the correct number of verses, 127, followed by the numbers of all the verses from 1 to 127, the resulting long number is a multiple of 19. Needless to say, if the wrong number of verses is used, i.e., 129 instead of 127, this remarkable miracle would have disappeared:

9 127 1 2 3 4 5 ..... 122 123 124 125 126 127.

The total number of verses in Sura 9 is followed by the numbers of every verse in the sura from 1 to 127. The resulting long number is a multiple of 19.

**[64]** The number of verses in Sura 9, 127, is an odd number. The falsifiers added two fake verses, and this made the number of verses 129, which is also an odd number. Mr. Arik used the same computer program he devised for Item 62 above to check all odd-numbered verses in the Quran. Thus, the number of verses in every sura was written down, followed only by the last digit of each of the odd-numbered verses in that sura. Sura 1 was represented by the number 71357. Sura 2 was represented by the number 28613579.....5, and so on through the last sura. The result is a long number, with 3371 digits, that is divisible by 19. Obviously, Sura 9 was represented by the number 12713579......7:

7 1 3 5 7 286 1 3 5 ... 3 5 ...... 5 1 3 5 6 1 3 5.

The number of verses in every sura is followed by the numbers of the odd-numbered verses. The resulting long number, 3371 digits, is a multiple of 19.

**[65]** Since Sura 9 is an un-initialed sura, Mr. Arik applied the same computer program to all 85 un-initialed suras. The number of every verse in each of the 85 suras was written down, without the number of verses in the sura. Thus, Sura 1 was represented by the number 1234567, not 71234567. This was done with all un-initialed suras. The final result is a number that consists of 6635 digits, and is a multiple of 19. These awesome phenomena would be destroyed if we used the wrong number of verses for Sura 9, i.e., 129 instead of 127.

## God’s Messenger of the Covenant Destined to Purify the Quran

**[66]** Finally, in a profound demonstration of the foreknowledge of the Almighty Author of the Quran, it is mathematically coded that “The person destined to prove that Sura 9 consists of 127 verses is Rashad Khalifa, God’s Messenger of the Covenant” (see [Appendix 2](/appendices/2)). The item presented here is another one of those numerous proofs; it is chosen for its relevance to this Appendix. The gematrical value of the word “Rashad,” as written in the Quran (40:29, 38) is 505 (R=200, Sh=300, A=1, and D=4). The gematrical value of the word “Khalifa,” as written in the Quran (38:26) is 725 (Kh=600, L=30, I=10, F=80, and H=5). By writing down the value of “Rashad,” followed by the value of “Khalifa,” followed by the number of Sura 9, followed by the correct number of verses in this sura, the product is 5057259127. This number is a multiple of 19; it equals 19×266171533.

**[67]** The number of verses from 3:81, where God’s Messenger of the Covenant is prophesied, to 9:127, the end of Sura 9, is 988 (19×52). Table 41.

**[68]** The sum of verse numbers from 3:81 to 9:127 is also a multiple of 19 (Table 41).

**Table 41: The number of verses from 3:81 to the end of Sura 9**

| Sura No. | No. of Verses | Sum of Verse #s |
| --- | --- | --- |
| 3 | 119 | 16860 |
| 4 | 176 | 15576 |
| 5 | 120 | 7260 |
| 6 | 165 | 13695 |
| 7 | 206 | 21321 |
| 8 | 75 | 2850 |
| 9 | 127 | 8128 |
|   | 988 | 85690 |
|   | (19×52) | (19×4510) |

**Table 42: Occurrence of the word “God” from 3:78 to the end of Sura 9**

| Sura Number | Frequency of “God” |
| --- | --- |
| 3 | 132 |
| 4 | 229 |
| 5 | 147 |
| 6 | 87 |
| 7 | 61 |
| 8 | 88 |
| 9 | 168 |
| Total = | 912 = 19×48 |

**[69]** In Verse 3:78, just 3 verses before proclaiming God’s Messenger of the Covenant, the word “God” number 361 (19×19) occurs. This verse (3:78) informs us that some falsifiers will “add falsehood to the Quran, then claim that it is part of the Quran; they attribute lies to God, knowingly.”

**[70]** The word “God” occurs 912 times (19×48) from Verse 3:78, which exposes the falsifiers, to 9:127.

**[71]** The number of letters, plus the number of words in 3:78 and in the false verses 9:128-129, give the same total, 143. Verse 3:78 consists of 27 words and 116 letters, & 9:128-129 consist of 115 letters and 28 words.

> ![Arabic](/appendices/app24_arabic.png)

## What Can We Say?

The overwhelming physical evidence provided by the Almighty to protect and authenticate His message leaves no doubt that: (1) no distortion of any kind can enter the Quran, (2) Verses 9:128-129 do not belong in the Quran, and (3) every element in the Quran is mathematically structured far beyond human capabilities — the number of suras, the number of verses, the numbers assigned to the suras and verses, the frequency of occurrence of key expressions, the number of words, the number of letters, and the unique and often uncommon spelling of certain words.

This Appendix documents a profound miracle in its own right. Vast and utterly overwhelming as it is, it does not surpass or even match the overall mathematical miracle of the Quran which is detailed in Appendix One. This merely confirms the fact that the Almighty Author of the Quran has deliberately permitted the blasphemous addition of two verses to Sura 9 in order to:

> (1) Demonstrate an essential function of the Quran’s mathematical composition.
>
> (2) Prove the impossibility of tampering with the Quran.
>
> (3) Fulfill God’s promise to distinguish the believers and expose the hypocrites.

## Why Did God Permit It For 1400 Years ??

Due to the mass corruption of Islam shortly after the prophet Muhammad’s death, God obviously has fulfilled His pledge in 47:38. A divine decree issued in Sura 47, which is entitled “Muhammad,” Verse 38 (19×2), stipulates that “if the Arabs failed to uphold the Quran, God will dismiss them from His grace, and substitute other people in their place.”

When the Arabs distorted the Quran a few years after the Prophet’s death, and exterminated the Prophet’s family in the process, they incurred God’s pledge of 47:38, and no longer deserved to possess the Quran; the true Quran. The evidence is irrefutable that the Arabs have abandoned the Quran en masse.

For example, there is not a single mosque in the so-called Muslim world today (1989) that upholds the crucial commandment: “The mosques belong to God; you shall not invoke anyone else besides God” (72:18).

The call to prayer (Azan) and the prayer itself are no longer devoted to God alone; Muhammad’s name is invariably invoked along with the name of God.

The “First Pillar of Islam” is clearly stated in the Quran, 3:18 & 47:19, and its words are decreed to be: LAA ELAAHA ELLA ALLAH (There is no other god besides God). But the Muslims, as early as the first century AH, do not want God if Muhammad is not invoked along with Him. This is easily demonstrable today by going into any mosque and declaring: “LAA ELAAHA ELLA ALLAH;” this will actually enrage today’s Muslims. This behavior is documented in the Quran, 39:45. Moreover, my own research has now convinced me that the traditional Muslims are forbidden by God from uttering the Quranic, divinely dictated Shahaadah: “Ash-hadu Allaa Elaaha Ellaa Allah.” They can never say this Shahaadah (without invoking Muhammad’s name). Test them yourself. The First Pillar of the distorted Islam, LAA ELAAHA ELLA ALLAH, MUHAMMAD RASOOL ALLAH, does not conform with God’s commandments that came to us through Muhammad (see [Appendix 13](/appendices/13)).

A number of other commandments are violated as well by this Mohammedan Shahaadah. For example, the Quran enjoins us repeatedly from making any distinction among God’s messengers (2:136, 285; 3:84). The distorted Shahaadah gives more distinction to Muhammad, against his will. Despite the Quran’s repeated assertions that it is “complete, perfect, and fully detailed” (6:19, 38, & 114), the “Muslims” have refused to believe their Creator; they uphold such ridiculous and nonsensical sources as Hadith and Sunna. This unanimous rebellion against God and His messenger, and the mass reversion to glaring idolatry — idolizing the Prophet and the saints — called for fulfillment of God’s pledge in 47:38.

In view of the incontrovertible divine evidence presented here, and in Appendices [Appendix 1](/appendices/1), [Appendix 2](/appendices/2), and [Appendix 26](/appendices/26), one can truly appreciate the following verses:

> Surely, we have revealed this message, and surely, we will preserve it.
>
> [15:9]
>
> Say, “If all the humans, and all the jinns, banded together, in order to produce a Quran like this, they will surely fail, no matter how much assistance they lend one another.”
>
> [17:88]
>
> The disbelievers rejected this message when it came to them, though it is a profound scripture. No falsehood can enter it, through addition or deletion. For it is a revelation from the Most Wise, Most Praiseworthy.
>
> [41:41-42]
>
> If we revealed this Quran to a mountain, you would see it trembling, crumbling, out of reverence for God.
>
> [59:21]

> I acknowledge with thanks the valuable contributions of Mahmoud Ali Abib, Gatut Adisoma, Abdullah Arik, Ihsan Ramadan, Lisa Spray, and Edip Yuksel. Some of the astounding mathematical facts presented in this Appendix were discovered by these hard working researchers at Masjid Tucson.
$md$, NULL, NULL),

-- Appendix 25: End of the World
('25', $md$> “(God is) the Knower of the future; He does not permit anyone to unveil such knowledge. Only through the messengers that He chooses does He reveal future and past events.”
>
> [72:27]

Among the duties charged to me as God's Messenger of the Covenant is unveiling the end of the world. We learn from [18:7]-8 and [69:13]-15 that this world will come to an end. A new earth and new heavens will replace the present heavens and earth ([14:48]).

## Signs of the Approaching End of the World

The Quran provides many signs, and states that the means for unveiling the end of the world have been given ([47:18]). The signs given in the Quran include:

1

The splitting of the moon

This already happened in June 1969 when we landed on the moon and brought back moon rocks. People on earth can go now to many museums, colleges and observatories to look at pieces of the moon.

2

Discovering the Quran's 19-based mathematical code ([74:30-37])

Fulfilled in 1969-1974.

3

The creature ([27:82])

"Made from the earth, it alerts the people that they have been oblivious to their Creator." The Creature, made from the earth, did appear and was instrumental in unveiling the Quran's numerical code, and proclaiming that the world has neglected God's message; the creature is the computer. Note that the digits that make up 27:82 add up to 19.

4

Appearance of God's Messenger of the Covenant ([3:81])

As detailed in Appendix 2, a consolidating messenger, prophesied in the Quran, comes after all the prophets have delivered the scriptures, to purify and unify. This prophecy was fulfilled in Ramadan 1408.

5

The Smoke ([44:10])

Occurs after God's Messenger of the Covenant has delivered the unified message and proclaimed Submission (Islam) as the only religion acceptable by God.

6

Gog and Magog ([18:94], [21:96])

They re-appear, in accordance with God's plan, in the year 1700 AH (2271 AD). Gog and Magog are mentioned in 18:94 and 21:96. If you count the verses from 18:94 to the end of Sura 18, you find them 17. If you count the verses from 21:96 to the end of Sura 21, you find them also 17. This is the Quran's sign that Gog and Magog will re-appear in 1700 AH.

## It Will Not Remain Hidden

Verse 15 of Sura 20 informs us that the end of the world will be revealed by God before the end of the world ([20:15]), and Sura 15, Verse 87, gives the time for that event:

> “We have given you the seven pairs, and the great Quran.”
>
> [15:87]

The seven pairs are the 14 Quranic Initials. The total gematrical value of these profound pillars of the Quran's miracle pinpoints the year of the end of the world. It is noteworthy that Verse 85 of Sura 15 states: “The end of the world will surely come to pass.” The next verse, [15:86], tells us that God is the Creator of this world, and, of course, He knows when it will end. The following verse, [15:87], tells us when the world will end.

As shown in Table 1, the gematrical values of “The Seven Pairs” of Quranic Initials total 1709 (see also Table 1 of [Appendix 1](/appendices/1)). According to [15:87], the world will survive for 1709 lunar years from the time this prophecy is stated in the Quran. This means that the world will end in the year 1710 AH — a multiple of 19: 1710 = 19×90.

Table 1: Total Gematrical Value of “The Seven Pairs” of Quranic Initials

| \# | Quranic Initial | Gematrical Value |
| --- | --- | --- |
| 1 | Q | 100 |
| 2 | N | 50 |
| 3 | S (Saad) | 90 |
| 4 | H.M. | 48 |
| 5 | Y.S. | 70 |
| 6 | T.H. | 14 |
| 7 | T.S. | 69 |
| 8 | A.L.M. | 71 |
| 9 | A.L.R. | 231 |
| 10 | T.S.M. | 109 |
| 11 | \`A.S.Q. | 230 |
| 12 | A.L.M.S. | 161 |
| 13 | A.L.M.R. | 271 |
| 14 | K.H.Y.\`A.S. | 195 |
| Total = | 1709 |   |

The unveiling of this information took place in the year 1400 AH, 309 years before the prophesied end of the world (1709 - 1400 = 309). The number 309 is a Quranic number ([18:25]), and is connected with the end of the world ([18:21]). The peculiar way of writing 309 in [18:25] — “Three hundred years, increased by nine” — indicates that the 309 are lunar years. The difference between 300 solar years and 300 lunar years is 9 years.

The year of this discovery, 1400 AH, coincided with 1980 AD, and 1980 plus 300 solar years is 2280, which is also a multiple of 19: 19×120. Thus the world ends in 1710 AH (19×90), which coincides with 2280 AD (19×120).

For the disbelievers who do not accept these powerful Quranic proofs, the end of the world will come suddenly ([6:31], [6:44], [6:47]; [7:95], [7:187]; [12:107]; [21:40], [22:55]; [26:202]; [29:53]; [39:55]; [43:66]; and [47:18]).

While Hadith is forbidden as a source of religious teachings ([Appendix 19](/appendices/19)), it can be a useful source of history. We can derive a lot of information about historical events and local customs and traditions during the early centuries of Islam. The books of Hadith indicate that the Quranic Initials were believed to determine the life span of the Muslim *Ummah*. The classic exegesis by Al-Baydaawy cites the following historical event as a possible explanation of the Quranic Initials. The same event is detailed in Al-Suyooty's *Itqaan* (First Printing, 1318 AH, Vol 2, Page 10):

> The Jews of Medina went to the Prophet and said, “Your Quran is initialed with A.L.M., and these Initials determine the life span of your religion. Since ‘A’ is 1, ‘L’ is 30, and ‘M’ is 40, this means that your religion will survive only 71 years.” Muhammad said, “We also have A.L.M.S.” They said, “The ‘A’ is 1, the ‘L’ is 30, the ‘M’ is 40, and the ‘S’ is 90. This adds up to 161. Do you have anything else?” The Prophet said, “Yes, A.L.M.R.” They said, “This is longer and heavier; the ‘A’ is 1, ‘L’ is 30, ‘M’ is 40, and ‘R’ is 200, making the total 271.” They finally gave up, saying, “We do not know how many of these Initials he was given!”
>
> [Al-Suyuty's Famous Reference: Itqaan]

Although this narration is well known, many scholars have been reluctant to accept the unmistakable connection between the Quranic Initials and the end of the world. They could not bring themselves to deal with this subject for the simple reason that the calculation makes the end of the world, and judgment, a reality.
$md$, 'D1SfcV27g3k', 'Appendix 25 — End of the World'),

-- Appendix 26: The Three Messengers of Islam
('26', $md$> “God took a covenant from the prophets, saying, ‘After I have given you the scripture and wisdom, a messenger will come to confirm what you have. You shall believe in him and support him.’”
>
> [3:81]

This appendix provides the Quranic mathematical evidence that (1) Abraham was the original messenger of Islam, i.e., Submission ([22:78]), (2) Muhammad was the scripture-delivering messenger ([47:2]), and (3) Rashad is the purifying and consolidating messenger who delivered the religion's authenticating proof ([3:81] & [Appendix 2](/appendices/2)).

## Perpetual and Verifiable Evidence

[1] As pointed out in [Appendix 2](/appendices/2), the gematrical value of “Abraham” is 258, the gematrical value of “Muhammad” is 92, the gematrical value of “Rashad” is 505, and 258+92+505 = 855 = 19×45.

[2] If we include “Ismail,” whose gematrical value is 211, and “Isaac,” whose gematrical value is 169, we still end up with a total gematrical value of 855+211+169 = 1235 = 19×65. The total gematrical value of the three messengers, or the five, cannot conform with the Quran's 19-based mathematical code if either Abraham, Muhammad, or Rashad is not included.

[3] The first and last occurrences of “Abraham” are in [2:124] and [87:19]. By adding the sura numbers, plus the number of verses, plus the sum of verse numbers from the first occurrence to the last occurrence, the grand total is 333,260 = 19×17540 (Table 1).

## Table 1: Suras & Verses — First to Last Occurrence of Abraham

| Sura No. | No. of Verses | Sum of Verse #s | Total |
| --- | --- | --- | --- |
| 2 | 163 | 33415 | 33580 |
| 3 | 200 | 20100 | 20303 |
| 4 | 176 | 15576 | 15756 |
| 5 | 120 | 7260 | 7385 |
| … | … | … | … |
| 9 | 127 | 8128 | 8264 |
| … | … | … | … |
| 84 | 25 | 325 | 434 |
| 85 | 22 | 253 | 360 |
| 86 | 17 | 153 | 256 |
| 87 | 19 | 190 | 296 |
| 3827 | 5835 | 323598 | 333260 (19×17540) |

[4] As pointed out in [Appendix 2](/appendices/2), the name of God's Messenger of the Covenant is introduced to the computer age through mathematical coding. If the name was specified in the Quran, as is the case with past messengers, millions of people would have named their children “Rashad Khalifa.” Thus, the root word “Rashada” is mentioned in the Quran 19 times ([Appendix 2](/appendices/2)).

[5] “Abraham” is mentioned in 25 suras, “Muhammad” is mentioned in 4 suras, and “Rashada” occurs in 9 suras. The total of these suras is 25+4+9 = 38 = 19×2 (INDEX TO THE WORDS OF QURAN, Abdul Baqi).

[6] If we add the numbers of the suras where Abraham, Muhammad, and Rashada occur, plus the number of occurrences per sura, the total comes to 1083 = 19×19×3 (Table 2).

## Table 2: Suras & Occurrences of Abraham, Muhammad, and Rashada

| Sura No. | Abraham | Muhammad | Rashada |
| --- | --- | --- | --- |
| 2 | 15 | \- | 2 |
| 3 | 7 | 1 | \- |
| 4 | 4 | \- | 1 |
| 6 | 4 | \- | \- |
| 7 | \- | \- | 1 |
| 9 | 3 | \- | \- |
| 11 | 4 | \- | 3 |
| 12 | 2 | \- | \- |
| 14 | 1 | \- | \- |
| 15 | 1 | \- | \- |
| 16 | 2 | \- | \- |
| 18 | \- | \- | 4 |
| 19 | 3 | \- | \- |
| 21 | 4 | \- | 1 |
| 22 | 3 | \- | \- |
| 26 | 1 | \- | \- |
| 29 | 2 | \- | \- |
| 33 | 1 | 1 | \- |
| 37 | 3 | \- | \- |
| 38 | 1 | \- | \- |
| 40 | \- | \- | 2 |
| 42 | 1 | \- | \- |
| 43 | 1 | \- | \- |
| 47 | \- | 1 | \- |
| 48 | \- | 1 | \- |
| 49 | \- | \- | 1 |
| 51 | 1 | \- | \- |
| 53 | 1 | \- | \- |
| 57 | 1 | \- | \- |
| 60 | 2 | \- | \- |
| 72 | \- | \- | 4 |
| 87 | 1 | \- | \- |
| 991 | 69 | 4 | 19 |

991+69+4+19 = 1083 = 19×19×3 (the 3 messengers). “Rashada” occurs 19 times.

[7] If we take all the suras where Abraham, Muhammad, and the root word “Rashada” are mentioned, and add the sura numbers, plus the number of the first verse in each sura where each of the three words is mentioned, the total comes to 2793 = 19×147 (Table 3).

## Table 3: Suras & First Verse Where Abraham, Muhammad, & Rashada Occur

| Sura No. | Abraham | Muhammad | Rashada |
| --- | --- | --- | --- |
| 2 | 124 | \- | 186 |
| 3 | 33 | 144 | \- |
| 4 | 54 | \- | 6 |
| 6 | 74 | \- | \- |
| 7 | \- | \- | 146 |
| 9 | 70 | \- | \- |
| 11 | 69 | \- | 78 |
| 12 | 6 | \- | \- |
| 14 | 35 | \- | \- |
| 15 | 51 | \- | \- |
| 16 | 120 | \- | \- |
| 18 | \- | \- | 10 |
| 19 | 41 | \- | \- |
| 21 | 51 | \- | 51\* |
| 22 | 26 | \- | \- |
| 26 | 69 | \- | \- |
| 29 | 16 | \- | \- |
| 33 | 7 | 40 | \- |
| 37 | 83 | \- | \- |
| 38 | 45 | \- | \- |
| 40 | \- | \- | 29 |
| 42 | 13 | \- | \- |
| 43 | 26 | \- | \- |
| 47 | \- | 2 | \- |
| 48 | \- | 29 | \- |
| 49 | \- | \- | 7 |
| 51 | 24 | \- | \- |
| 53 | 37 | \- | \- |
| 57 | 26 | \- | \- |
| 60 | 4 | \- | \- |
| 72 | \- | \- | 2 |
| 87 | 19 | \- | \- |
| 991 | 1123 | 215 | 464 |

991+1123+215+464 = 2793 = 19×147.

\* Verse 21:51 cannot be added twice.

[8] The sum of all sura numbers where the three words occur, without repetition, plus the sum of all the verse numbers, without repetition, add up to 6479 = 19×341. The suras are 2, 3, 4, 6, 7, 9, 11, 12, 14, 15, 16, 18, 19, 21, 22, 26, 29, 33, 37, 38, 40, 42, 43, 47, 48, 49, 51, 53, 57, 60, 72, and 87. The sum of these numbers is 991 (see Table 3). The verses where the three words are mentioned, without repetition, are 2, 4, 6, 7, 10, 13, 14, 16, 17, 19, 21, 24, 26, 29, 31, 33, 35, 37, 38, 40, 41, 43, 45, 46, 51, 54, 58, 60, 62, 65, 66, 67, 68, 69, 70, 74, 75, 76, 78, 83, 84, 87, 95, 97, 104, 109, 114, 120, 123, 124, 125, 126, 127, 130, 132, 133, 135, 136, 140, 144, 146, 161, 163, 186, 256, 258, and 260. The sum of these numbers is 5488, and: 5488 + 991 = 6479 = 19×341.

[9] If we add the sura number, plus the verse number, plus the number of verses where Abraham, Muhammad, and Rashada occur, we get a grand total that equals 7505 = 19×395 (Table 4).

## Table 4: Suras, Verses & Occurrences of Abraham, Muhammad, & Rashada

| Sura No. | Abraham | Muhammad | Rashada | No. of Verses |
| --- | --- | --- | --- | --- |
| 2 | 124, 125, 126, 127, 130, 132, 133, 135, 136, 140, 258, 260 | \- | 186, 256 | 14 |
| 3 | 33, 65, 67, 68, 84, 95, 97 | 144 | \- | 8 |
| 4 | 54, 125, 163 | \- | 6 | 4 |
| 6 | 74, 75, 83, 161 | \- | \- | 4 |
| 7 | \- | \- | 146 | 1 |
| 9 | 70, 114 | \- | \- | 2 |
| 11 | 69, 74, 75, 76 | \- | 78, 87, 97 | 7 |
| 12 | 6, 38 | \- | \- | 2 |
| 14 | 35 | \- | \- | 1 |
| 15 | 51 | \- | \- | 1 |
| 16 | 120, 123 | \- | \- | 2 |
| 18 | \- | \- | 10, 17, 24, 66 | 4 |
| 19 | 41, 46, 58 | \- | \- | 3 |
| 21 | 51, 60, 62, 69 | \- | 51 | 5 |
| 22 | 26, 43, 78 | \- | \- | 3 |
| 26 | 69 | \- | \- | 1 |
| 29 | 16, 31 | \- | \- | 2 |
| 33 | 7 | 40 | \- | 2 |
| 37 | 83, 104, 109 | \- | \- | 3 |
| 38 | 45 | \- | \- | 1 |
| 40 | \- | \- | 29, 38 | 2 |
| 42 | 13 | \- | \- | 1 |
| 43 | 26 | \- | \- | 1 |
| 47 | \- | 2 | \- | 1 |
| 48 | \- | 29 | \- | 1 |
| 49 | \- | \- | 7 | 1 |
| 51 | 24 | \- | \- | 1 |
| 53 | 37 | \- | \- | 1 |
| 57 | 26 | \- | \- | 1 |
| 60 | 4 | \- | \- | 1 |
| 72 | \- | \- | 2, 10, 14, 21 | 4 |
| 87 | 19 | \- | \- | 1 |
| 991 | 5068 | 215 | 1145 | 86 |

991+5068+215+1145+86 = 7505 = 19×395.

Thus, it is mathematically coded into the Quran that Abraham, Muhammad, and Rashad are the three messengers of Islam (Submission).

[10] As shown in Table 4, the 19 occurrences of the root word “Rashada” are in verses 186, 256, 6, 146, 78, 87, 97, 10, 17, 24, 66, 51, 29, 38, 7, 2, 10, 14, and 21. These are 38 digits = 19×2.

[11] Table 4 shows that the sum of the verse numbers where we see the 19 occurrences of the root word “Rashada” is 1145. By adding this total of verse numbers (1145), to the gematrical value of the name “Rashad” (505), plus the gematrical value of the name “Khalifa” (725), we get 1145+505+725 = 2375 = 19×125.

[12] If we write down these numbers next to each other, i.e., the total of verse numbers (1145), followed by the gematrical value of the name “Rashad” (505), followed by the gematrical value of the name “Khalifa” (725), we also get a number that is a multiple of 19: 1145505725 = 19×60289775.

> Sum of Verse Numbers Where the 19 “Rashada” Occur = 1145
>
> Gematrical Value of the Name “Rashad” = 505
>
> Gematrical Value of the Name “Khalifa” = 725
>
> 1145 + 505 + 725 = 2375 = 19 × 125
>
> 1145 505 725 = 1145505725 = 19 × 60289775
$md$, NULL, NULL),

-- Appendix 27: Who Is Your God?
('27', $md$Most people are outraged upon hearing this question. “What do you mean, ‘Who is your god?’ they ask, ‘My god is the Creator of the heavens and the earth.’ ” And most of these people will be shocked to find out that their proclamation that their god is the Creator of the heavens and the earth is no more than lip service, and that they are in fact destined for Hell ([12:106]).

> Your god is whoever or whatever occupies your mind most of the time.

Your god can be your children ([7:190]), your spouse ([9:24]), your business ([18:35]), or your ego ([25:43]). This is why we note that one of the most important and most repeated commandments in the Quran is:

> “O you who believe, you shall remember God frequently; glorify Him day and night.”
>
> [33:41]

To put this commandment into practice, we must establish certain habits whereby we guarantee that God occupies our minds more than anything else. The Quran helps us establish such soul saving habits:

## Six Habits to Remember God

1. **The Contact Prayers (Salat):** those who observe the 5 daily prayers come a long way towards commemorating God a significant proportion of their waking hours. Salat helps us remember God not only during the few minutes of prayer, but also throughout the times of anticipation. At 11:00 AM, one may look at his or her watch to see if the noon prayer is due yet. This act causes one to think about God, and one is credited accordingly ([20:14]).
2. **Commemorate God before eating:** Verse [6:121] enjoins us to mention God's name before we eat: “You shall not eat from that upon which God's name has not been mentioned.”
3. **God Willing (IN SHAA ALLAH):** “You shall not say, ‘I will do this or that tomorrow,’ without saying, ‘God willing’ (IN SHAA ALLAH). If you forget to do this, then apologize and say, ‘May my Lord guide me to do better next time.’” ([18:24]). This is a direct commandment that we must carry out, no matter who we are talking with.
4. **God's Gift (MAA SHAA ALLAH):** To invoke God's protection for our beloved objects - our children, our cars, our homes, etc. - we are enjoined in [18:39] to say “MAA SHAA ALLAH” (This is God's gift).
5. **Glorify God day and night:** When we eat anything, we shouldn't be like animals; we must reflect on God's creation of the food we are eating - the flavor, our enjoyment due to the senses God has given us, the perfect packaging of the banana or the orange, the varieties of sea foods created by God, etc. - and glorify Him as we enjoy His provisions. When we see a beautiful flower, or animal, or sunsets, we must glorify God. We must seize every possible opportunity to remember and glorify God, so that God may be our God.
6. **First Utterance:** Make it a habit to say: “In the name of God, Most Gracious, Most Merciful. There is no other god besides God,” the moment you wake up every morning. If you establish this good habit, this is what you will utter when you are resurrected.
$md$, 'gAa7XWY78I8', 'Appendix 27 — Who Is Your God?'),

-- Appendix 28: Muhammad Wrote God's Revelations With His Own Hand
('28', $md$> “Read, in the name of your Lord, who created. He created man from an embryo. Read, and your Lord, Most Exalted. Teaches by means of the pen.”
>
> [96:1-4]

The first revelation was “Read,” and included the statement “God teaches by means of the pen” ([96:1-4]), and the second revelation was “The Pen” ([68:1]). The only function of the pen is to write.

Ignorant Muslim scholars of the first two centuries after the Quran could not understand the Quran's challenge to produce anything like it. They had no idea about the Quran's mathematical composition, and they knew that many literary giants could have composed works comparable to the Quran. In fact, many such literary giants did claim the ability to produce a literary work as excellent as the Quran. The latest claim came from Taha Hussein, the renowned Egyptian writer.

The ignorant Muslim scholars then decided to proclaim Muhammad an illiterate man! They figured that this would make the Quran's extraordinary literary excellence truly miraculous.

## The Word “Ummy”

The word they relied on to bestow illiteracy upon the Prophet was “UMMY.” Unfortunately for those “scholars,” this word clearly means “Gentile,” or one who does not follow any scripture (Torah, Injeel, or Quran) — see [2:78], [3:20], [3:75], [62:2]. It does NOT mean “illiterate.”

The Prophet was a successful merchant. The “Muslim scholars” who fabricated the illiteracy lie forgot that there were no numbers during the Prophet's time — the letters of the alphabet were used as numbers. As a merchant dealing with numbers every day, the Prophet had to know the alphabet, from one to one-thousand.

## The Quran's Own Testimony

The Quran tells us that Muhammad wrote down the Quran. His contemporaries are quoted as saying: “These are tales from the past that he wrote down. They are being dictated to him day and night” ([25:5]). You cannot “dictate” to an illiterate person. The Prophet's enemies who accuse him of illiteracy abuse [29:48], which relates specifically to previous scriptures.

On the 27th night of Ramadan 13 B.H. (Before Hijerah), Muhammad — the soul, the real person, not the body — was summoned to the highest universe and the Quran was given to him ([2:97], [17:1], [44:3], [53:1-18], [97:1-5]). Subsequently, the angel Gabriel helped Muhammad release a few verses of the Quran at a time, from the soul to Muhammad's memory. The Prophet wrote down and memorized the verses just released into his mind.

When the Prophet died, he left the complete Quran written down with his own hand in the chronological order of revelation, along with specific instructions as to where to place every verse. The divine instructions recorded by the Prophet were designed to put the Quran together into the final format intended for God's Final Testament to the world ([75:17]). The early Muslims did not get around to putting the Quran together until the time of Khalifa Rashed ‘Uthmaan. A committee was appointed to carry out this task. Read [Appendix 24](/appendices/24) for the details.
$md$, 'XkG1mHWW-QE', 'Appendix 28 — Muhammad Wrote God''s Revelations With His Own Hand'),

-- Appendix 29: The Missing Basmalah
('29', $md$Every sura in the Quran opens with the statement “In the name of God, Most Gracious, Most Merciful,” known as the *Basmalah*, with the exception of Sura 9. This conspicuous absence of the *Basmalah* from Sura 9 has been an intriguing feature of the Quran for 14 centuries. Many theories have been advanced to explain this phenomenon.

Now we learn that the missing *Basmalah* plays a significant role as [1] a significant constituent of the Quran's mathematical miracle, and [2] a glaring sign from the Most Gracious, Most Merciful, that Sura 9 has been tampered with and must be purified ([Appendix 24](/appendices/24)). Both roles of the missing *Basmalah* were revealed with the discovery of the Quran's mathematical code. The following list of factual observations illustrate the miraculous features of the missing *Basmalah*:

## Twelve Miraculous Features

[1] Since the *Basmalah* consists of 19 Arabic letters, and prefixes all the suras except one, it can be considered the foundation upon which the Quran's 19-based code is built. But the absence of the *Basmalah* from Sura 9 causes the number of this crucial opening statement to be 113, a number that does not conform with the Quran's code. However, we find that this deficiency is compensated for in Sura 27. Two *Basmalah*s occur in Sura 27, one as an opener and one in Verse 30. This restores the total number of *Basmalah*s in the Quran to 114 = 19×6.

[2] From the missing *Basmalah* of Sura 9 to the extra *Basmalah* of Sura 27, there are 19 suras.

[3] The sum of sura numbers from the missing *Basmalah* (Sura 9) to the extra *Basmalah* (Sura 27) is 9+10+11+12+…+25+26+27 = 342 = 19×18. This is a mathematical property, any consecutive 19 numbers will add up to a multiple of 19. But the miraculous phenomenon is that this number, 342, equals the number of words from the first *Basmalah* of Sura 27 to the second *Basmalah* in [27:30].

[4] The occurrence of the extra *Basmalah* in [27:30] conforms with the Quran's code in that the sura number, plus the verse number is a multiple of 19 (27+30 = 57 = 19×3).

[5] The occurrence of the extra *Basmalah* in Verse 30 compares with the occurrence of the number 19 itself in Verse 30 (Sura 74).

[6] The Quran contains 6234 numbered verses. The absence of the *Basmalah* from Sura 9, and compensating for it in Verse 30 of Sura 27 gives us two numbered *Basmalah*s, [1:1] & [27:30], and 112 un-numbered *Basmalah*s. This causes the total number of verses in the Quran to be 6234+112 = 6346 = 19×334.

[7] From the missing *Basmalah* to the extra *Basmalah*, the number of verses containing the word “Allah” is 513 = 19×27. Note that 27 is the sura number where the extra *Basmalah* occurs. The data are in Table 1.

## Table 1: The Verses Containing the Word “Allah” from the Missing Basmalah to the Extra Basmalah

| Sura Number | Verses w/ “Allah” |
| --- | --- |
| 9 | 100 |
| 10 | 49 |
| 11 | 33 |
| 12 | 34 |
| 13 | 23 |
| 14 | 28 |
| 15 | 2 |
| 16 | 64 |
| 17 | 10 |
| 18 | 14 |
| 19 | 8 |
| 20 | 6 |
| 21 | 5 |
| 22 | 50 |
| 23 | 12 |
| 24 | 50 |
| 25 | 6 |
| 26 | 13 |
| 27 | 6 |
| 342 (19×18) | 513 (19×27) |

[8] The sum of verse numbers (1+2+3+…+n), plus the number of verses, from the missing *Basmalah* to the extra *Basmalah* is 119,624 = 19×6296. See Table 2.

## Table 2: Suras & Verses From the Missing Basmalah to the Extra Basmalah

| Sura | Verses | Sum of Verse # |
| --- | --- | --- |
| 9 | 127 | 8,128 |
| 10 | 109 | 5,995 |
| 11 | 123 | 7,626 |
| 12 | 111 | 6,216 |
| 13 | 43 | 946 |
| 14 | 52 | 1,378 |
| 15 | 99 | 4,950 |
| 16 | 128 | 8,256 |
| 17 | 111 | 6,216 |
| 18 | 110 | 6,105 |
| 19 | 98 | 4,851 |
| 20 | 135 | 9,180 |
| 21 | 112 | 6,328 |
| 22 | 78 | 3,081 |
| 23 | 118 | 7,021 |
| 24 | 64 | 2,080 |
| 25 | 77 | 3,003 |
| 26 | 227 | 25,878 |
| 27 | 29 | 435 |
| 342 | 1951 | 117,673 |

342 + 1951 + 117,673 = 119,624 = 19 × 6296

[9] This item also proves that Sura 9 consists of 127 verses, not 129 (see [Appendix 24](/appendices/24)). The sum of digits of 127 is 1+2+7=10. By finding all the verses whose digits add up to 10, from the missing *Basmalah* of Sura 9 to the extra *Basmalah* of Sura 27, then adding the number of these verses to the total number of verses from the missing *Basmalah* to the extra *Basmalah*, we get 2128 = 19×112 (Table 3).

[10] Sura 9 is an odd-numbered sura whose number of verses (127) is also odd. From the missing *Basmalah* to the extra *Basmalah*, there are 7 suras that possess this property; they are odd-numbered suras whose numbers of verses are also odd. As detailed in Table 4, these are Suras 9, 11, 13, 15, 17, 25, and 27. By adding the digits that make up the sura numbers and the numbers of verses, the grand total is 114 = 19×6.

## Table 3: The Verse Whose Digits Add Up to 10, from the Missing Basmalah to the Extra Basmalah

| Sura No | No. of Verses | No. of Occurrences |
| --- | --- | --- |
| 9 | 127 | 12 |
| 10 | 109 | 10 |
| 11 | 123 | 11 |
| 12 | 111 | 10 |
| 13 | 43 | 3 |
| 14 | 52 | 4 |
| 15 | 99 | 9 |
| 16 | 128 | 12 |
| 17 | 111 | 10 |
| 18 | 110 | 10 |
| 19 | 98 | 9 |
| 20 | 135 | 12 |
| 21 | 112 | 10 |
| 22 | 78 | 7 |
| 23 | 118 | 11 |
| 24 | 64 | 6 |
| 25 | 77 | 7 |
| 26 | 227 | 22 |
| 27 | 29 | 2 |
| 342 (19×18) | 1951 | 177 |

1951 + 177 = 2128 = 19 × 112

## Table 4: The Odd-numbered Suras Whose Number of Verses are also Odd

| Sura No. | Sum of Digits | No of Verses | Sum of Digits |
| --- | --- | --- | --- |
| 9 | 9 | 127 | 10 |
| 11 | 2 | 123 | 6 |
| 13 | 4 | 43 | 7 |
| 15 | 6 | 99 | 18 |
| 17 | 8 | 111 | 3 |
| 25 | 7 | 77 | 14 |
| 27 | 9 | 29 | 11 |
|   | 45 |   | 69 |

45 + 69 = 114 = 19 × 6

[11] The next two features authenticate both the missing *Basmalah* and the number of verses in Sura 9 (where two false verses had been injected). If we take the same suras listed in Table 4, odd-numbered suras whose numbers of verses are also odd, and write down the number of every sura, followed by its number of verses, the resulting long number (30 digits) is a multiple of 19 (Figure 1).

> 9 127  11 123  13 43  15 99  17 111  25 77  27 29
>
> Every sura number is followed by the number of verses in that sura. This long number = 19 × 48037427533385052195322409091

[12] Let us continue to work with the suras listed in Table 4. They are the odd-numbered suras whose verses are also odd-numbered, from the missing *Basmalah* to the extra *Basmalah*. If we write down the number of every sura, followed by the last digit in every verse in that sura, we end up with a long number, 1988 digits, which is divisible by 19 (Figure 2).

> 9 1234567890123…  …  27 1234567890 … 789
>
> The sura number is followed by the last digit in every verse number.
$md$, NULL, NULL),

-- Appendix 30: Polygamy
('30', $md$Polygamy was a way of life until the Quran was revealed 1400 years ago. When the earth was young and under-populated, polygamy was one way of populating it and bringing in the human beings needed to carry out God's plan. By the time the Quran was revealed, the world had been sufficiently populated, and the Quran put down the first limitations against polygamy.

Polygamy is permitted in the Quran, but under strictly observed circumstances. Any abuse of this divine permission incurs severe retribution. Thus, although polygamy is permitted by God, it behooves us to examine our circumstances carefully before saying that a particular polygamous relationship is permissible.

## The Prophet's Example

Our perfect example here is the prophet Muhammad. He was married to one wife, Khadijah, until she died. He had all his children, except one, from Khadijah. Thus, she and her children enjoyed the Prophet's full attention for as long as she was married to him — twenty-five years. For all practical purposes, Muhammad had one wife from the age of 25 to 50.

During the remaining 13 years of his life, he married the aged widows of his friends who left many children. The children needed a complete home with a fatherly figure, and the Prophet provided that. Providing a fatherly figure for orphans is the only specific circumstance in support of polygamy mentioned in the Quran ([4:3]).

Other than marrying widowed mothers of orphans, there were three political marriages in the Prophet's life. His close friends Abu Bakr and Omar insisted that he marry their daughters, Aisha and Hafsah, to establish traditional family ties among them. The third marriage was to Maria the Egyptian; she was given to him as a political gesture of friendship from the ruler of Egypt.

This perfect example tells us that a man must give his full attention and loyalty in marriage to his wife and children in order to raise a happy and wholesome family.

## The Quranic Limitations

The Quran emphasizes the limitations against polygamy in very strong words:

“If you fear lest you may not be perfectly equitable in treating more than one wife, then you shall be content with one.” ([4:3])

“You cannot be equitable in a polygamous relationship, no matter how hard you try.” ([4:129])

The Quranic limitations against polygamy point out the possibility of abusing God's law. Therefore, unless we are absolutely sure that God's law will not be abused, we had better resist our lust and stay away from polygamy. If the circumstances do not dictate polygamy, we had better give our full attention to one wife and one set of children. The children's psychological and social well-being, especially in countries where polygamy is prohibited, almost invariably dictate monogamy. A few basic criteria must be observed in contemplating polygamy:

## Basic Criteria

1. It must alleviate pain and suffering and not cause any pain or suffering.
2. If you have a young family, it is almost certain that polygamy is an abuse.
3. Polygamy to substitute a younger wife is an abuse of God's law ([4:19]).
$md$, 'OTYzP1BgWow', 'Appendix 30 — Polygamy'),

-- Appendix 31: Evolution: A Divinely Guided Process
('31', $md$We learn from the Quran that evolution is a divinely designed fact:

> Life began in water
>
> “From water we initiated all living things.” ([21:30], [24:45])
>
> Humans not descendants of monkeys
>
> “He started the creation of man from mud.” ([32:7])
>
> Man created from “aged” mud
>
> “I am creating the human being from ‘aged’ clay.” ([15:28])

Evolution is possible only within a given species. For example, the navel orange evolved from seeded oranges, not from apples. The laws of probability preclude the possibility of haphazard evolution between species. A fish cannot evolve into a bird; a monkey can never evolve into a human.

## Probability Laws Preclude Darwin's Evolution

In this computer age, we have mathematical laws that tell us whether a certain event is probable or not. If we throw five numbered cubes up in the air and let them fall into a guided straight line, the probability laws tell us the number of possible combinations we can get: 1×2×3×4×5 = 120 combinations. Thus, the probability of obtaining any combination is 1 in 120, or 1/120, or 0.0086.

This probability diminishes fast when we increase the number of cubes. If we increase them by one, the number of combinations becomes 1×2×3×4×5×6 = 720, and the probability of getting any combination diminishes to 1/720, 0.0014. Mathematicians, who are very exacting scientists, have agreed that the probability diminishes to “Zero” when we increase the number of cubes to 84. If we work with 84 cubes, the probability diminishes to 209×10⁻⁵⁰, or 0.00000000000000000000000000000000000000000000000000209

Darwin's famous statement that “life began as a ‘simple’ cell” is laughable. As recently as 50 years ago, Wells, Huxley, and Wells wrote in their classic textbook that “nothing can be seen inside the nucleus but clear fluid.” We know now that the cell is an extremely complex unit, with billions of nucleotides in the gene material inside the nucleus, and millions of biochemical reactions. The probability laws tell us that the probability of the haphazard creation of the exacting sequences of nucleotides into DNA is Zero, many times over. We are not talking about 84 nucleotides; we are talking about billions of nucleotides that must be arranged in a specific sequence.

Some evolutionists have stated that the human gene and the monkey's gene are 90% similar. However, even if the similarity was 99%, we are still talking about 300,000,000 nucleotides that must be haphazardly re-arranged to change the monkey into a human. The probability laws preclude this as an utter impossibility. The human gene contains 30,000,000,000 nucleotides; 1% of that is 300,000,000.

A fitting quote here is that of Professor Edwin Conklin; he stated:

> The probability of life originating from accident is comparable to the probability of the Unabridged Dictionary resulting from an explosion in a printing factory.
$md$, '3HN_sTndr04', 'Appendix 31 — Evolution: Divinely Controlled'),

-- Appendix 32: The Crucial Age of 40
('32', $md$What is the age of responsibility? If a child dies at the age of 12, without even hearing about God, does this child go to Heaven or Hell? What if the child is 15 years old, or 21, or 25? At what age will the human being be held responsible for his or her beliefs? This question has puzzled researchers of all religions for a long time.

The Quran sets the age of responsibility at 40; anyone who dies before this age goes to Heaven ([46:15]). If the person believed in God and benefitted from belief by nourishing and developing the soul (see [Appendix 15](/appendices/15)), he or she goes to the High Heaven. Otherwise, the person goes to the Lower Heaven.

## God's Mercy

Your first reaction to this piece of information is objection: “What if the person was really bad, evil, and an atheist, will he go to Heaven if he died before the age of 40?” This is because you are mean, while God is the Most Merciful. Our tendency is to “put them all in Hell.”

People who objected strongly to this Divine mercy cannot come up with a cut-off age of responsibility. They ask questions like, “What if the person was really wicked?” The answer is, “Does God know that this person was wicked?” “Yes.” “Does God know that this person does not deserve to go to Heaven?” “Yes.” “Therefore, this person will not die before the age of 40.” As simple as that. God is the only one who terminates our lives on this earth. He knows exactly who deserves to go to Heaven and who deserves to go to Hell.

## A Confirming Sign

Early in 1989 a man by the name of Theodore Robert Bundy was executed for killing a number of women. The whole nation agreed that he was one of the most vicious criminals in history. So much so that his execution was one of the rare occasions where the opponents of capital punishment did not protest. On the contrary, many people actually celebrated his execution. Numerous journalists, editorials, and politicians lamented the fact that justice took eleven years to execute Ted Bundy. They stated that Bundy should have been executed within a maximum of six years after his conviction. According to the Quran, this would have been the greatest favor anyone could have done to Bundy. He was 42 years old when executed. Had he been executed five years earlier, at the age of 37, he would have gone straight to Heaven, and he did not deserve that.

As it turns out, Bundy was one of the signs God has given us to confirm that anyone who dies before 40 goes to Heaven. Bundy's name, Theodore Robert Bundy, consists of 19 letters, and he confessed to killing 19 women just one day before his execution. There were many other signs from God.

Delivering this important piece of information is one of the responsibilities given to me as God's Messenger of the Covenant. It is not my personal opinion.

It is noteworthy that both Martin Luther King and Malcolm X were assassinated just a couple of months before their 40th birthdays.
$md$, 'J53TKCcic8I', 'Appendix 32 — The Crucial Age of 40'),

-- Appendix 33: Why Did God Send a Messenger Now?
('33', $md$As stated in [3:81], and in [Appendix 2](/appendices/2), God has sent a messenger to consolidate the messages delivered by all the prophets, purify them, and unify them into one religion: Submission. The timing is certainly ripe for fulfillment of this important prophecy, for the following reasons:

1. Judaism, Christianity, and Islam have been corrupted beyond recognition.
2. All God's messages have been delivered; the Quran is the Final Testament.
3. More than 93% of the human beings destined to live in this world are yet to come. As illustrated in the Introduction, the people who have lived on this earth since Adam are only one-fifteenth of the total projected human population.

## Judaism

The best illustration of today's corrupted Judaism can be found in the books of a famous Rabbi; Harold S. Kushner. In his best seller *When Bad Things Happen to Good People*, Avon Books, 1981, Rabbi Kushner states the following:

> “…, we would be advised to take this world as seriously as we can, in case it turns out to be the only one we will ever have, and to look for meaning and justice here. (P. 29)”
>
> “Bad things do happen to good people in this world, but it is not God who wills it. God would like people to get what they deserve, but He cannot always arrange it. (P. 42)”
>
> “God does not reach down to interrupt the workings of laws of nature to protect the righteous from harm. This is a second area of our world which causes bad things to happen to good people, and God does not cause it and cannot stop it. (P. 58)”
>
> “God can't do everything, but He can do some important things. (P. 113)”
>
> “We can't ask Him to make us immune to disease, because He can't do that. (P. 125)”
>
> “I recognize His limitations. He is limited in what He can do by law of nature, and by the evolution of human nature and human moral freedom. (P. 134)”

## Christianity

If Jesus came back to life today, the Christians would crucify him. Outstanding Christian scholars have reached solid conclusions that today's Christianity has nothing to do with Jesus, and that its doctrine was mortally distorted at the infamous Nicene Conferences (325 A.D.). See *The Myth of God Incarnate*, Westminster Press, Philadelphia, 1977.

## Islam

If Muhammad came back to this world, the “Muslims” would stone him to death. The religion they follow today has nothing to do with the Islam, i.e., Submission, preached by Abraham and Muhammad. Everything the “Muslims” do is wrong: the First Pillar (Shahaadah), the call to Salat prayer (Azan), the ablution (Wudu), the daily Salat prayers, the Zakat charity, Hajj, and all other practices of Islam (see [Appendices 2](/appendices/2), [13](/appendices/13), & [15](/appendices/15)).

## “A Religion Never Authorized by God” ([42:21])

The extent to which Islam has been corrupted is illustrated in the following table:

| Innovation | Violated Quranic Principles |
| --- | --- |
| Hadith & Sunna | [6:19], [6:38], [6:114]; [7:1-3]; [12:111]; [17:46]; [31:6]; [45:6]; [69:38-47]; plus more. |
| Killing whomever they consider an apostate | [2:256]; [4:90]; [10:99]; [18:29]; [88:21-22] |
| Vicious criminal justice system: |   |
| Cutting off the hand of the thief | [5:38], [12:31] |
| Stoning the adulterers to death | [24:2], [4:25] |
| Killing anyone who does not observe Salat | [2:256], [18:29] |
| Killing one who drinks alcohol for the 4th time | [2:256], [18:29] |
| Forbidding menstruating women from worshiping | [2:222] |
| Forbidding women from the Friday Prayer | [62:9] |
| Idolizing Muhammad against his will: |   |
| calling him “the most honorable messenger” | [2:285] |
| claiming that he was infallible | [4:79]; [9:117]; [17:73-74]; [33:37]; [40:66], [66:1]; [80:1-10]; [93:7] |
| setting up his tomb as a “Sacred Mosque” | [2:149-150] |
| claiming that he possesses power of intercession | [2:48], [2:123], [2:254]; [6:70], [6:94]; [7:53]; [10:3]; [39:44]; [43:86]; [74:48] |
| Inventing an indefensible story about his ascension to the heavens on a horse, at the speed of light, and talking God out of 50 Salat prayers. At the speed of light, he would still be traveling within the Milky Way Galaxy. | [17:1]; [53:1-18] |
| Adding his name in the Salat prayers & Azan | [20:14]; [72:18] |
| Adding his name to the First Pillar of Islam | [3:18]; [37:35]; [39:45] |
| Insulting Muhammad by depicting him as a vicious man: |   |
| they claim he gouged out people's eyes | [3:159]; [68:4] |
| Claiming he possessed sexual power of 30 men | [18:110]; [25:20] |
| Nullifying the fact that Muhammad was the last prophet by teaching that Jesus will come back to this world. This makes Jesus the last prophet. | [33:40] |
| Claiming that Muhammad was illiterate, un-intelligent. | See [Appendix 28](/appendices/28) |
| A bizarre dietary system with multitudes of prohibitions | [6:145-150]; [16:115-116] |
| Altering the Sacred Months | [9:37] |
| Neglecting the Zakat charity through distortion | [6:141], [Appendix 15](/appendices/15) |
| Oppressing women and forcing them to wear head-covers and unreasonable clothes; and depriving them of all rights in marriage, divorce, inheritance, etc. | [2:228]; [3:195]; [4:19], [4:32]; [9:71] |
| Insulting women by instituting that “if a monkey, dog, or a woman passes in front of a praying person, his prayer is nullified” (Hadith) |   |
| Inventing numerous rules from ablution, to prayer, to sleeping, to cutting one's nails | [5:101]; [42:21]; [2:67-71] |
| Prohibiting gold and silk for men | [5:48-49]; [7:31-32] |
| Prohibiting music and the arts | [7:32]; [34:13]; [42:21] |
| Ridiculing Islam by stating that the earth is built on top of a giant whale!! ([79:30]; Ibn Kathir, 1200 AD & Ben Baz, 1975 AD) |   |

This is only a minute sample of the violations committed by the “Muslims” on a daily basis. This is why God has sent His Messenger of the Covenant now.
$md$, 'qaJTFggUvDU', 'Appendix 33 — Why Did God Send A Messenger Now?'),

-- Appendix 34: Virginity/Chastity: A Trait of the True Believers
('34', $md$> Sons and daughters of the true believers must be taught that their happiness throughout their lives depends on following God's law and preserving their chastity. This means that they must keep themselves for their spouses only, and never allow anyone else to touch them in a sexual manner ([23:5-6], [24:30], [33:35], [70:29-30]).

Today's society is replete with powerful temptations. In America's society of the eighties, even parents start talking about boyfriends for their daughters and girlfriends for their sons. When they reach their teens, many parents even supply birth control means to their children. An alarming percentage of teen-agers are sexually active, even though they are not physiologically mature, and without any moral limitations. Millions of illicit pregnancies and the tragedies associated with them, plus millions of tragic abortions, happen every month in the USA.

Among the results of this moral breakdown: unwanted and unsupported children, delinquent and irresponsible fathers, criminals who have no regard for people's lives or properties, millions of social misfits, incurable genital herpes, incurable genital warts, devastating syphilis and gonorrhea, dysplasia, the killer AIDS, and new diseases never known before.

What most people do not know is that this moral breakdown costs them dearly throughout their lives. For the only law that rules the world is God's law, and these flagrant violations of God's law cost them a lot of misery and problems ([20:124]).

The true believers who care about their children will advise them and remind them repeatedly and persistently ([20:132]) to keep their chastity. This means staying virgin until their wedding night, then staying loyal to one's spouse — never committing adultery — for their own happiness. God's advice to keep our chastity, before and after marriage, is for our own good. God is the one who controls our health, wealth, and happiness or misery ([53:43], [53:48]).
$md$, 'M84OWAjOYdQ', 'Appendix 34 — Virginity'),

-- Appendix 35: Drugs & Alcohol
('35', $md$There is no compromise whatsoever regarding illicit drugs and alcoholic beverages; they are called “abominations and the work of Satan” ([5:90]). In [2:219] and [5:90], we see that “intoxicants, gambling, the idols' altars, and games of chance” are strictly prohibited.

The word used for intoxicants is “Khamr” from the root word “Khamara” which means “to cover.” Thus, anything that covers or hinders the mind is prohibited. This includes anything that alters the mind, such as marijuana, heroin, cocaine, alcohol, hashish, and anything else that affects the mind.
$md$, 'UNYn4b_65_Q', 'Appendix 35 — Drugs & Alcohol'),

-- Appendix 36: What Price A Great Nation
('36', $md$> “If the people of the scripture (Jews, Christians, and Muslims) believe and maintain a righteous life, we will remit their sins and admit them into the blissful Heaven. Had they observed the Torah, the Gospel, and what is revealed herein from their Lord, they would have enjoyed provisions from above them, and from beneath their feet. Some of them are righteous, but most of them are evil doers.” ([5:65-66])
>
> “If only the people of the various communities believed and maintained a righteous life, we would have showered them with blessings from the heaven and the earth.” ([7:96])
>
> “God is the One who controls your happiness, or misery… God is the One who makes you rich or poor.” ([53:43], [53:48])

A nation that upholds God's laws is guaranteed prominence among the nations of the world, victory, prosperity, and happiness ([10:62-64], [16:97], [24:55], [41:30-31]). On the other hand, a nation that violates God's laws incurs a miserable life ([20:124]). A nation that upholds God's laws is guaranteed to be a great nation. This is not a mere idealistic dream; since God is in full control ([10:61]), His guarantees and promises are done. A nation that upholds God's laws is characterized by:

## Nine Characteristics of a Great Nation

1. **Maximum freedom for the people** — freedom of religion, freedom of expression, freedom to travel, and freedom of economy ([2:256], [10:99], [88:21-22]).
2. **Guaranteed human rights for all the people**, regardless of their race, color, creed, social status, financial situation, or political affiliation ([5:8], [49:13]).
3. **Prosperity for all the people.** God's economic system is based on constant circulation of wealth, no usury, and productive investment. Non-productive economy such as gambling, lottery, and high interest loans are not permitted ([2:275-277], [59:7]).
4. **Social justice for all.** Because of the obligatory charity (Zakat), no one will go hungry or un-sheltered ([2:215], [70:24-25], [107:1-7]).
5. **A political system that is based on unanimous consensus.** Through mutual consultation and freedom of expression, one side of any given issue convinces all participants in the discussion. The end result is a unanimous agreement, not the opinion of a 51% majority rammed down the throat of the 49% minority ([42:38]).
6. **A society that upholds and maintains the highest standards of moral behavior.** There will be a strong family, no alcoholism, no illicit drugs, no illegitimate pregnancies, no abortions, and practically no divorce.
7. **Maximum regard for people's lives and properties.** Therefore, there will be no crime against the people's lives or properties.
8. **Prevalence of love, courtesy, peace, and mutual respect** among the people, and between this nation and other world communities ([3:110], [60:8-9]).
9. **Environmental protection** is guaranteed through conservation and prohibition of wasteful practices ([30:41]).
$md$, 'tCHFzFE3LTo', 'Appendix 36 — What Price A Great Nation'),

-- Appendix 37: Criminal Justice in Islam
('37', $md$If a thief steals a thousand dollars from you, and they put him in prison, what do you get? If the thief has a wife and children, what is their crime? Why should they be deprived of their father?

The Quran solves this problem, as well as the problems associated with the criminal justice systems prevalent in today's world.

## Equivalence is the Law [[2:178-179]]

According to the Quranic criminal justice, the thief who is convicted of stealing a thousand dollars from you must work for you until you are fully paid for the thousand dollars you lost, plus any other damage and inconvenience the theft may have caused you. At the same time, the thief's innocent wife and children are not deprived of their man, and the expensive prison system is eliminated. Imprisonment is a cruel and inhumane punishment that has proven useless to all concerned.

Contrary to common belief, the thief's hand shall not be cut off. Thank God for His mercy and His mathematical miracle in the Quran, we know now that the thief's hand is to be *marked*. Marking the hand of the thief is stated in [5:38]. The sura and verse numbers add up to 5+38 = 43. The other place in the Quran where “the hand is cut” is found in [12:31]. This is where we see the women who admired Joseph so much, they “cut” their hands. Obviously, they did not sever their hands; no one can do that. The sura and verse numbers add up to 12+31 = 43, the same total as in [5:38]. This gives mathematical confirmation that the Quranic law calls for marking the hand of the thief, not severing it. Additional mathematical confirmation is provided: 19 verses after [12:31], we see the “cutting of the hand” again. Punishment in Submission (Islam) is based on equivalence and social pressure ([2:178], [5:38], [24:2]).

The blasphemy called “Hadith & Sunna” has instituted stoning to death as the punishment for married adulterers. This is not God's law. As stated in [24:2], the punishment for adultery is whipping in public; a hundred symbolic lashes. As pointed out above, the basic punishment is social pressure and scandalizing the criminal. Whipping in public achieves this goal.

In dealing with murder, the Quran definitely discourages capital punishment ([2:179]). “The free for the free, the slave for the slave, and the female for the female” ([2:178]). Due to human meanness and injustice, many people cannot even imagine what this Quranic law says. They refuse to accept the clear injunctions that strict equivalence must be observed - if a woman kills a man, or a man kills a woman, or a slave kills a free person, or a free person kills a slave, capital punishment cannot be applied. The Quran prefers that the murderer compensate the victim's family. Killing the murderer does not bring the victim back, nor does the family of the victim benefit from executing the murderer. The compensation, however, must be sufficient to be a deterrent for others. In Submission (Islam), the victim and/or the victim's family are the judges for all crimes; they decide what the punishment shall be under the supervision of a person who knows the Quran.
$md$, 'WZ6gxmN61V4', 'Appendix 37 — Criminal Justice'),

-- Appendix 38: The Creator's Signature
('38', $md$The scriptures are not the only mathematically composed creations of God where the number 19 is the common denominator. It is profound indeed that Galileo made his famous statement: “Mathematics is the language with which God created the universe.” A plethora of scientific findings have now shown that the number 19 represents God's signature upon certain creations. This divine stamp appears throughout the universe in much the same manner as the signature of Michelangelo and Picasso identify their works. For example:

## 19 in Creation

1. The sun, the moon, and the earth become aligned in the same relative positions once every 19 years (see *Encyclopedia Judaica* under “Calendar”).
2. Halley's comet, a profound heavenly phenomenon, visits our solar system every 76 years, 19×4.
3. God's stamp on you and me is manifested in the fact that the human body contains 209 bones, 19×11.
4. *Langman's Medical Embryology*, by T. W. Sadler, is used as a textbook in most of the Medical Schools in the U.S.A. On Page 88 of the Fifth edition, we read the following statement: “In general the length of pregnancy for a full term fetus is considered to be 280 days or 40 weeks after onset of the last menstruation, or more accurately, 266 days or 38 weeks after fertilization.” The numbers 266 and 38 are both multiples of 19.
$md$, '310Gs6vO8kM', 'Appendix 38 — 19: The Creator''s Signature');

-- ── resolve the rows this run would touch ────────────────────────────────────
-- English-language Quran versions only. jsonb concatenation is a shallow merge,
-- so title, snippet, version_id and code in the existing draft are preserved.
-- An appendix with no video has any stale video keys stripped, which is what
-- makes a re-run converge rather than accumulate.

CREATE TEMPORARY TABLE appendix_targets ON COMMIT DROP AS
SELECT
  a.id,
  a.code,
  v.slug        AS version_slug,
  a.published IS NOT NULL AS is_published,
  a.draft       AS old_draft,
  CASE
    WHEN b.video_id IS NULL THEN
      (a.draft - 'video_id'::text - 'video_title'::text) || jsonb_build_object('body', b.body)
    ELSE
      a.draft || jsonb_build_object(
        'body',        b.body,
        'video_id',    b.video_id,
        'video_title', b.video_title
      )
  END AS new_draft
FROM public.editorial_appendices a
JOIN public.quran_versions v ON v.id = a.version_id
JOIN public.languages     l ON l.id = v.lang_id
JOIN appendix_backfill    b ON b.code = a.code
WHERE l.code = 'en'
  AND (:'version' = '' OR v.slug = :'version');

-- ── report ──────────────────────────────────────────────────────────────────

\echo ''
\echo '── appendix codes with no matching English row ─────────────────────────'
SELECT b.code, left(regexp_replace(b.body, '\s+', ' ', 'g'), 60) AS body_preview
FROM appendix_backfill b
WHERE NOT EXISTS (SELECT 1 FROM appendix_targets t WHERE t.code = b.code)
ORDER BY b.code::int;

\echo ''
\echo '── per-row changes ────────────────────────────────────────────────────'
SELECT
  t.code,
  t.version_slug,
  CASE WHEN t.is_published THEN 'published' ELSE 'draft' END AS row_state,
  length(coalesce(t.old_draft->>'body', ''))  AS body_before,
  length(t.new_draft->>'body')                AS body_after,
  coalesce(t.old_draft->>'video_id', '-')     AS video_before,
  coalesce(t.new_draft->>'video_id', '-')     AS video_after,
  CASE WHEN t.old_draft IS DISTINCT FROM t.new_draft THEN 'CHANGES' ELSE 'unchanged' END AS verdict
FROM appendix_targets t
ORDER BY t.code::int;

\echo ''
\echo '── summary ────────────────────────────────────────────────────────────'
SELECT
  (SELECT count(*) FROM appendix_backfill)                            AS codes_in_script,
  count(*)                                                            AS rows_matched,
  count(*) FILTER (WHERE old_draft IS DISTINCT FROM new_draft)        AS rows_to_update,
  count(*) FILTER (WHERE jsonb_exists(new_draft, 'video_id'))          AS rows_with_video,
  count(*) FILTER (WHERE coalesce(old_draft->>'body', '') = '')       AS rows_with_empty_body_before
FROM appendix_targets;

-- ── write ───────────────────────────────────────────────────────────────────

UPDATE public.editorial_appendices a
SET draft = t.new_draft,
    updated_at = now()
FROM appendix_targets t
WHERE a.id = t.id
  AND a.draft IS DISTINCT FROM t.new_draft;

\if :publish
  \echo ''
  \echo '── publishing (copying draft into the published snapshot) ──────────────'
  UPDATE public.editorial_appendices a
  SET published = a.draft,
      published_at = now(),
      updated_at = now()
  FROM appendix_targets t
  WHERE a.id = t.id
    AND a.published IS DISTINCT FROM a.draft;
\else
  \echo ''
  \echo 'publish: skipped (pass -v publish=true to copy drafts into published)'
\endif

\if :apply
  COMMIT;
  \echo ''
  \echo 'APPLIED: the changes above are committed.'
\else
  ROLLBACK;
  \echo ''
  \echo 'DRY RUN: nothing was written. Re-run with -v apply=true to commit.'
\endif
