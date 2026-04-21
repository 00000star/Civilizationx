# Decision Log

## 2026-04-21: Collapse and Space Are One Product

Decision: CivilizationX will treat collapse recovery and space settlement as mirror use cases.

Reason: both require recursive dependency knowledge, raw material substitution, repair, safety, and offline access.

## 2026-04-21: Offline-First Is Core

Decision: The app should remain useful after installation without internet.

Reason: both target scenarios involve unreliable connectivity.

## 2026-04-21: Safety Is Product Functionality

Decision: warnings, hazard labels, gates, source quality, and verification status are not legal decoration; they are core product behavior.

Reason: bad instructions in this project can injure or kill people.

## 2026-04-21: Use Summaries Before Full Entries

Decision: tree/pathfinder/foundations should use lightweight generated summaries, while full documentary entries load lazily.

Reason: the project needs to scale beyond dozens of entries without making the first app load carry every long-form JSON document.

## 2026-04-21: Local `.pi` Board Tracks Agent Work

Decision: use `/home/starking/.pi/civilizationx-agent-board.json` as the active Jira-style board when live Atlassian Jira is unreachable.

Reason: Jira credentials exist locally, but Atlassian connections timed out from this environment.
