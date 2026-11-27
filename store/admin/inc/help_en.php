<div class="card help">
<h1>❓ Help – IES Store RFQ Admin</h1>
<p>This page is for IES staff. It explains how to handle quotation requests (RFQs) that customers send from the online store, and how to keep the RFQ data safe.</p>
<ol class="toc">
<li><a href="#h1">Sign in and session</a></li>
<li><a href="#h2">RFQ register</a></li>
<li><a href="#h3">Open an RFQ and reply</a></li>
<li><a href="#h4">Status and internal notes</a></li>
<li><a href="#h5">Export to Excel</a></li>
<li><a href="#h6">Backup</a></li>
<li><a href="#h7">Restore from a backup</a></li>
<li><a href="#h8">Audit log</a></li>
<li><a href="#h9">Password and lost access</a></li>
<li><a href="#h10">Where the data is kept</a></li>
</ol>

<h2 id="h1">1. Sign in and session</h2>
<ul>
<li>Open <b>al-khadraa.com/store/admin/</b> and sign in with the admin user name and password.</li>
<li>After 8 wrong attempts the sign-in is blocked for 15 minutes.</li>
<li>The session closes after 60 minutes without activity. Sign in again; nothing is lost.</li>
<li>Switch the language with <b>عربي / English</b> in the top bar.</li>
</ul>

<h2 id="h2">2. RFQ register</h2>
<ul>
<li>Every RFQ sent from the store (English or Arabic page) appears here, newest first. IES also receives each RFQ by e-mail at info@ies-iraq.com.</li>
<li>The coloured boxes count RFQs by status. Click a box to show only that status; click <b>All</b> to show all.</li>
<li>Search finds RFQ number, company, contact, phone, e-mail and any part number or description in the items.</li>
</ul>

<h2 id="h3">3. Open an RFQ and reply</h2>
<ul>
<li>Click a row to open the RFQ: customer details, message and the item list (source: STOCK = Baghdad warehouse, SUP = Supmea, SPR = legacy spares, BOM = pasted list).</li>
<li>Click the phone number to open WhatsApp, or the e-mail address to write an e-mail with the RFQ number in the subject.</li>
<li>Prepare the quotation with the normal IES offer workflow (estimate sheet, offer on letterhead). The target is a reply within one working day (Saturday–Thursday).</li>
</ul>

<h2 id="h4">4. Status and internal notes</h2>
<ul>
<li>Statuses: <b>New</b> → <b>In progress</b> → <b>Quoted</b> → <b>Won</b> or <b>Lost</b>; <b>Closed</b> for requests that need no further action (spam, duplicates, cancelled).</li>
<li>Choose the status, write a note if useful (offer number, price, follow-up date) and press <b>Save</b>. Notes are internal; the customer never sees them.</li>
<li>Every change is recorded with date and user. Notes cannot be edited or deleted – add a new note to correct one.</li>
</ul>

<h2 id="h5">5. Export to Excel</h2>
<ul>
<li><b>Export to Excel</b> downloads the full register: sheet <i>RFQs</i> (one row per RFQ with status and notes), sheet <i>Lines</i> (one row per item) and sheet <i>Info</i>.</li>
<li>Use it for follow-up meetings, sales reports and as an extra record copy on OneDrive.</li>
</ul>

<h2 id="h6">6. Backup</h2>
<ul>
<li>A backup is made automatically at the first sign-in of each day and before every restore. Press <b>Save a backup now</b> for an extra one (for example before a website update).</li>
<li>Each backup ZIP holds all RFQ files, the status and notes file, the audit log and the Excel register. The newest 30 backups are kept on the server.</li>
<li>Download a backup at least once a month and save it in <b>OneDrive\Documents\IES Online Store\Backup</b>.</li>
</ul>

<h2 id="h7">7. Restore from a backup</h2>
<ol>
<li>Open <b>Backup &amp; restore</b>, choose the backup ZIP and press <b>Upload &amp; verify</b>.</li>
<li>Read the verification report: errors, warnings, RFQs to add, RFQs already in the register.</li>
<li>If the report is correct, type <b>RESTORE</b> and press <b>Apply restore</b>.</li>
</ol>
<p>Restore only adds missing RFQs (and their status and notes). It never changes or deletes RFQs already in the register. A backup is made automatically just before the restore.</p>

<h2 id="h8">8. Audit log</h2>
<p>Shows the last 200 actions: sign-in (also failed attempts), status changes, exports, backups, downloads and restores, with time (UTC), user and details.</p>

<h2 id="h9">9. Password and lost access</h2>
<ul>
<li>Change the password under <b>Account</b> (minimum 10 characters).</li>
<li>If the password is lost: in GoDaddy cPanel › File Manager open <b>public_html/store/api/data/</b>, delete <b>admin_config.php</b> and create an empty file named <b>SETUP_ALLOWED</b>. Open the admin page and create the account again. RFQs are not affected.</li>
</ul>

<h2 id="h10">10. Where the data is kept</h2>
<ul>
<li>Server folder <b>public_html/store/api/data/</b> (closed to the internet): one JSON file per RFQ, <i>status.json</i>, <i>audit.log</i>, <i>backups/</i>.</li>
<li>Never delete this folder when the website is updated. The website update package does not contain it.</li>
</ul>
</div>
