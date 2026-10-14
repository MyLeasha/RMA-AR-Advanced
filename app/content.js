/*
	RMA Compliance AR - course buttons (Full AR experience version)

	This is the file to edit when courses change.
	- right: buttons to the right of the medal, top to bottom
	- left:  buttons to the left of the medal, top to bottom
	- label: text on the button
	- width: length of the blue button (about 0.3 per character; adjust until the text fits)
	- url:   LMS link the button opens
	- topY:  height of the first row (0.15 for 4 rows per side, 0.3 for up to 7 rows)

	After saving, raise the number in version.json so phones download this file again.
*/
window.RMA_AR_CONTENT = {
	topY: 0.3,
	right: [
		{ label: 'Business Continuity', width: 5, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42832&ref=qrcode' },
		{ label: 'Code of Ethics', width: 4, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42678&ref=qrcode' },
		{ label: 'Risk Management', width: 4.5, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42830&ref=qrcode' },
		{ label: 'Treating Customers Fairly', width: 5.75, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42831&ref=qrcode' },
		{ label: 'Occupational Health and Safety', width: 7, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42575&ref=qrcode' },
		{ label: 'Financial Crime Risk Management', width: 7.5, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42587&ref=qrcode' }
	],
	left: [
		{ label: 'AML: What is Anti Money Laundering?', width: 8.5, url: 'https://lms.randmutual.co.za/admin_item_published.aspx?id=42518&ipd=51972&idtype=10' },
		{ label: 'AML: The Legal Framework', width: 6, url: 'https://lms.randmutual.co.za/admin_item_published.aspx?id=42515&ipd=51972&idtype=10' },
		{ label: 'AML: Anti Money Laundering Roles', width: 8, url: 'https://lms.randmutual.co.za/admin_item_published.aspx?id=42514&ipd=51972&idtype=10' },
		{ label: 'AML: Suspicious and Unusual Behaviours', width: 9, url: 'https://lms.randmutual.co.za/admin_item_published.aspx?id=42517&ipd=51972&idtype=10' },
		{ label: 'AML: Consequences of non-compliance', width: 9, url: 'https://lms.randmutual.co.za/admin_item_published.aspx?id=42516&ipd=51972&idtype=10' },
		{ label: 'The POPI Act', width: 3.5, url: 'https://lms.randmutual.co.za/student/player_scorm.aspx?idlp=42592&ref=qrcode' }
	]
};
