import { ExternalLink } from 'lucide-react';

interface WorkstreamLinkProps {
  itemId: string;
}

const REPO_URL = 'https://github.com/bcali/roadmap-dashboard';

/**
 * Renders a link to the workstream .md file on GitHub for a given roadmap item.
 * Level 1 items link to initiative.md, level 2 items link to their epic .md.
 */
export function WorkstreamLink({ itemId }: WorkstreamLinkProps) {
  // Determine the workstream file path from the item ID pattern
  // IDs follow: PAY-001 (initiative), PAY-010 (epic), PAY-011 (task)
  const prefix = itemId.split('-')[0]; // PAY, LOY, ANA
  const num = parseInt(itemId.split('-')[1], 10);

  let filePath: string;

  if (num < 10) {
    // Level 1 initiative (PAY-001, LOY-001, ANA-001)
    filePath = `workstreams/${itemId}/initiative.md`;
  } else if (num % 10 === 0 && num < 100) {
    // Level 2 epic (PAY-010, PAY-020, etc.)
    // Find parent initiative
    const initId = `${prefix}-001`;
    filePath = `workstreams/${initId}/${itemId}.md`;
  } else {
    // Level 3 task — link to parent epic
    const epicNum = Math.floor(num / 10) * 10;
    const epicId = `${prefix}-${String(epicNum).padStart(3, '0')}`;
    const initId = `${prefix}-001`;
    filePath = `workstreams/${initId}/${epicId}.md`;
  }

  const url = `${REPO_URL}/blob/main/${filePath}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
    >
      <ExternalLink size={12} />
      <span>Workstream Notes</span>
    </a>
  );
}
