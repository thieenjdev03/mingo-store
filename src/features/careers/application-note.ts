/**
 * The backend `CareerApplicationDto.cover_letter` field is the only free-text slot the
 * apply API exposes. The public form packs two logically separate answers (portfolio
 * link, message to the team) into it so admin can still render them as distinct,
 * labeled sections instead of one run-on paragraph.
 */
const PORTFOLIO_LABEL = 'Portfolio / social profile: ';
const MESSAGE_LABEL = 'Nhắn gửi đến team:\n';
const SECTION_DELIMITER = '\n\n---\n\n';

export interface ApplicationNoteInput {
  portfolio?: string;
  message?: string;
}

export interface ApplicationNote {
  portfolio: string | null;
  message: string | null;
  /** Anything that doesn't match a known section — older submissions were a single free-text blob. */
  other: string | null;
}

export function encodeApplicationNote({ portfolio, message }: ApplicationNoteInput): string | undefined {
  const sections: string[] = [];
  if (portfolio) sections.push(`${PORTFOLIO_LABEL}${portfolio}`);
  if (message) sections.push(`${MESSAGE_LABEL}${message}`);
  return sections.length > 0 ? sections.join(SECTION_DELIMITER) : undefined;
}

export function decodeApplicationNote(coverLetter: string | null | undefined): ApplicationNote {
  if (!coverLetter) return { portfolio: null, message: null, other: null };

  let portfolio: string | null = null;
  let message: string | null = null;
  const other: string[] = [];

  for (const section of coverLetter.split(SECTION_DELIMITER)) {
    if (section.startsWith(PORTFOLIO_LABEL)) {
      portfolio = section.slice(PORTFOLIO_LABEL.length).trim();
    } else if (section.startsWith(MESSAGE_LABEL)) {
      message = section.slice(MESSAGE_LABEL.length).trim();
    } else if (section.trim()) {
      other.push(section.trim());
    }
  }

  return { portfolio, message, other: other.length > 0 ? other.join('\n\n') : null };
}
