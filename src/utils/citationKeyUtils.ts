import * as bibtexParser from "@retorquere/bibtex-parser";
import { logMessage } from "../extension";

const commonWords: string[] = ["a", "an", "the", "to", "with", "on", "and", "for", "of", "in", "into", "by", "as", "from", "its", "some", "like"];
const replacements: [string, string][] = [
	["top", "top"],
	["homeo", "homeo"],
	["homo", "homo"],
	["diff", "diff"],
	["prod", "prod"],
	["fund", "fund"],
	["embed", "emb"],
	["dimen", "dim"],
	["config", "conf"],
	["neighbor", "nbd"],
	["support", "supp"],
	["finite", "fin"],
	["general", "gen"],
	["constr", "cnstr"],
	["smooth", "smth"],
	["submanif", "submfld"],
	["distrib", "dist"],
	["manif", "mfld"],
	["geod", "geo"],
	["riem", "riem"],
	["variable", "var"],
	["invaria", "inv"],
	["curvature", "curv"],
	["symm", "sym"],
	["compact", "cpt"],
	["charac", "char"],
	["group", "grp"],
	["space", "sp"],
];

const wordsCutoff = 5;

function generateCitationKeyFromTitle(title: string): string {
	title = title
		.replace(/\$[^$]*\$/g, "")
		.replace(/<[^>]*>/g, "")
		.replace(/&[^;]*;/g, "")
		.replace(/[^\w\s-]/g, "");
	const words = title.split(/[\s-_]+/).filter((word) => !commonWords.includes(word.toLowerCase()));
	const updatedWords = words.map((word) => {
		let newWord = word;
		for (const [search, replace] of replacements) {
			if (word.toLowerCase().startsWith(search.toLowerCase())) {
				newWord = replace;
				break;
			}
		}
		return newWord.charAt(0).toUpperCase() + newWord.slice(1).toLowerCase();
	});
	return updatedWords.slice(0, wordsCutoff).join("");
}

function generateCitationKeyFromAuthors(authors: bibtexParser.Creator[]) {
	const lastNames = authors.map((author) => {
		const lastName = author.lastName || author.firstName || author.name || undefined;
		if (lastName) {
			return lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
		} else {
			return "";
		}
	});
	return lastNames.join("");
}

export function generateFullCitationKey(entry: bibtexParser.Entry) {
	const title = entry.fields.title;
	const authors = entry.fields.author || entry.fields.bookauthor || undefined;
	let titleKey = "";
	if (title) {
		titleKey = generateCitationKeyFromTitle(title);
	}
	let authorKey = "";
	if (authors) {
		authorKey = generateCitationKeyFromAuthors(authors);
	}
	const newKey = authorKey + titleKey;
	if (newKey) {
		return newKey;
	} else {
		return entry.key;
	}
}