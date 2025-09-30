#!/usr/bin/env python3
"""
Shard digest.txt into LLM-friendly chunks.

This script splits the large digest.txt file into smaller files
organized in docs/digest/ directory.
"""

import os
import re
from pathlib import Path
from typing import List, Tuple


def parse_digest(digest_path: Path) -> Tuple[str, List[Tuple[str, str]]]:
    """
    Parse digest.txt into directory structure and file sections.

    Returns:
        Tuple of (directory_structure, list of (filename, content) tuples)
    """
    with open(digest_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all file sections with pattern:
    # ================================================
    # FILE: <filename>
    # ================================================
    file_pattern = re.compile(
        r'={48}\n'  # First separator line
        r'FILE:\s+(.+?)\n'  # FILE: <filename>
        r'={48}\n'  # Second separator line
        r'(.*?)'  # Content (non-greedy)
        r'(?=\n={48}\nFILE:|$)',  # Look ahead to next file or end
        re.DOTALL
    )

    # Find first file section to split directory structure
    first_match = file_pattern.search(content)
    if first_match:
        dir_structure = content[:first_match.start()]
    else:
        dir_structure = content

    # Extract all files
    files = []
    for match in file_pattern.finditer(content):
        filename = match.group(1)
        file_content = match.group(2)
        files.append((filename, file_content))

    return dir_structure, files


def create_chunks(
    dir_structure: str,
    files: List[Tuple[str, str]],
    max_chunk_size: int = 50000
) -> List[Tuple[str, str]]:
    """
    Create chunks from files, respecting max_chunk_size.

    Args:
        dir_structure: Directory structure content
        files: List of (filename, content) tuples
        max_chunk_size: Maximum characters per chunk

    Returns:
        List of (chunk_name, chunk_content) tuples
    """
    chunks = []

    # First chunk: directory structure
    chunks.append(("00-directory-structure.txt", dir_structure))

    # Group files into chunks
    current_chunk = []
    current_size = 0
    chunk_num = 1

    for filename, content in files:
        file_section = f"{'=' * 48}\nFILE: {filename}\n{'=' * 48}\n{content}\n\n"
        file_size = len(file_section)

        # If single file is too large, create dedicated chunk
        if file_size > max_chunk_size:
            # Save current chunk if not empty
            if current_chunk:
                chunk_content = "".join(current_chunk)
                chunks.append((f"{chunk_num:02d}-files.txt", chunk_content))
                chunk_num += 1
                current_chunk = []
                current_size = 0

            # Create dedicated chunk for large file
            safe_filename = re.sub(r'[^\w\-.]', '_', filename)
            chunks.append((f"{chunk_num:02d}-{safe_filename}.txt", file_section))
            chunk_num += 1

        # If adding file would exceed limit, save current chunk
        elif current_size + file_size > max_chunk_size and current_chunk:
            chunk_content = "".join(current_chunk)
            chunks.append((f"{chunk_num:02d}-files.txt", chunk_content))
            chunk_num += 1
            current_chunk = [file_section]
            current_size = file_size

        # Otherwise, add to current chunk
        else:
            current_chunk.append(file_section)
            current_size += file_size

    # Save remaining chunk
    if current_chunk:
        chunk_content = "".join(current_chunk)
        chunks.append((f"{chunk_num:02d}-files.txt", chunk_content))

    return chunks


def write_chunks(chunks: List[Tuple[str, str]], output_dir: Path) -> None:
    """Write chunks to output directory."""
    output_dir.mkdir(parents=True, exist_ok=True)

    for chunk_name, chunk_content in chunks:
        output_path = output_dir / chunk_name
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(chunk_content)
        print(f"✓ Created {chunk_name} ({len(chunk_content):,} chars)")


def main():
    """Main execution function."""
    # Paths
    project_root = Path(__file__).parent.parent
    digest_path = project_root / "digest.txt"
    output_dir = project_root / "docs" / "digest"

    print("Resume Matcher - Digest Sharding Tool")
    print("=" * 50)
    print()

    # Check if digest.txt exists
    if not digest_path.exists():
        print(f"❌ Error: {digest_path} not found")
        return 1

    print(f"📖 Reading {digest_path}...")
    dir_structure, files = parse_digest(digest_path)
    print(f"✓ Found directory structure and {len(files)} files")
    print()

    print("📦 Creating chunks...")
    chunks = create_chunks(dir_structure, files, max_chunk_size=50000)
    print(f"✓ Created {len(chunks)} chunks")
    print()

    print(f"💾 Writing to {output_dir}...")
    write_chunks(chunks, output_dir)
    print()

    print("✅ Digest sharding complete!")
    print(f"📁 Output directory: {output_dir}")
    print(f"📊 Total chunks: {len(chunks)}")

    return 0


if __name__ == "__main__":
    exit(main())