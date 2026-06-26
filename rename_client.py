import os, re

files_to_update = [
    'frontend/src/views/components/Login.jsx',
    'frontend/src/views/pages/admin/AdminUsersView.jsx',
    'frontend/src/views/pages/admin/AdminSettingsView.jsx',
    'frontend/src/views/pages/company/CompanyProfileView.jsx',
    'frontend/src/views/pages/company/CompanyShiftNoticesView.jsx',
    'frontend/src/views/pages/employee/EmployeeClientNotificationsView.jsx',
    'frontend/src/views/pages/employee/EmployeeLeaveView.jsx',
    'frontend/src/views/pages/hr/HRClientNotificationsView.jsx',
    'frontend/src/views/pages/hr/HREmployeesView.jsx',
    'frontend/src/views/pages/hr/HRLeaveApprovalsView.jsx'
]

replacements = [
    (r"'Client'", r"'Client/Lead'"),
    (r'"Client"', r'"Client/Lead"'),
    (r'>Client<', r'>Client/Lead<'),
    (r'>Client ', r'>Client/Lead '),
    (r' Client ', r' Client/Lead '),
    (r' Client<', r' Client/Lead<'),
    (r' Client:', r' Client/Lead:'),
    (r'>Clients<', r'>Clients/Leads<'),
    (r'"Clients"', r'"Clients/Leads"'),
    (r"'Clients'", r"'Clients/Leads'"),
    (r' Clients ', r' Clients/Leads '),
    (r' client ', r' client/lead '),
    (r' clients ', r' clients/leads '),
    (r'Client Assignment', r'Client/Lead Assignment'),
    (r'Current Client', r'Current Client/Lead'),
    (r'Assign to Client', r'Assign to Client/Lead'),
    (r'Client Notifications', r'Client/Lead Notifications'),
    (r'Client Messages', r'Client/Lead Messages'),
    (r'client notifications', r'client/lead notifications'),
    (r'Client Leave', r'Client/Lead Leave'),
    (r'Client Profile', r'Client/Lead Profile'),
    (r'Client Partner', r'Client/Lead Partner'),
    (r'Client ID', r'Client/Lead ID'),
    (r'Add Client', r'Add Client/Lead'),
    (r'Update Client', r'Update Client/Lead'),
    (r'Client Company', r'Client/Lead Company'),
    (r'Client Companies', r'Client/Lead Companies'),
    (r'client companies', r'client/lead companies'),
]

for file_path in files_to_update:
    full_path = os.path.join('c:/Users/ADMIN/OneDrive/Desktop/AppzMaker-main/AppzMaker-main', file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old, new in replacements:
            new_content = re.sub(old, new, new_content)
            
        if content != new_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {file_path}')
    else:
        print(f'File not found: {file_path}')
