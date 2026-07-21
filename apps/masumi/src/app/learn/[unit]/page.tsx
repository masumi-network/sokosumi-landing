import { notFound } from "next/navigation";
import { getUnit, units } from "../course-data";
import { Lesson } from "../learn-client";
import { requireLearnUser } from "@/lib/learn-auth";

export function generateStaticParams() { return units.map((unit) => ({ unit: unit.slug })); }
export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) { const { unit: slug } = await params; const unit = getUnit(slug); if (!unit) notFound(); await requireLearnUser(`/learn/${slug}`); const lesson = { slug: unit.slug, number: unit.number, title: unit.title, summary: unit.summary, duration: unit.duration, lastReviewed: unit.lastReviewed, accuracyReviewer: unit.accuracyReviewer, objectives: unit.objectives, sections: unit.sections, checkpoint: unit.checkpoint, readHref: unit.readHref, buildHref: unit.buildHref, referenceHref: unit.referenceHref }; return <Lesson unit={lesson} />; }
