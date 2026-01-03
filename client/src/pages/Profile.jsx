import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

const Profile = () => {
    const { id } = useParams(); // employeeId
    const location = useLocation();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null); // Logged in user
    const [profile, setProfile] = useState(null); // Profile being viewed
    const [activeTab, setProfileTab] = useState('Resume');
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({});
    const [salaryData, setSalaryData] = useState({});

    // UI Helpers
    const [newSkill, setNewSkill] = useState('');
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [showCertInput, setShowCertInput] = useState(false);
    const [newCert, setNewCert] = useState({ name: '', org: '' });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(storedUser);

        const fetchId = id || storedUser.employeeId;
        
        // Own profile logic
        const own = !id || parseInt(id) === parseInt(storedUser.employeeId);
        setIsOwnProfile(own);

        const fromNav = location.state?.fromNav || !id;
        // Edit is allowed for own profile if opened via Nav, OR for Admin/HR
        const canEdit = (own && fromNav) || storedUser.role === 'ADMIN' || storedUser.role === 'HR';
        setIsEditable(canEdit);

        fetchProfile(fetchId, id ? 'emp' : 'user');
    }, [id, location]);

    const fetchProfile = async (identifier, type) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/employees/profile/${identifier}?type=${type}`);
            setProfile(response.data);
            setFormData(response.data);
            if (response.data.salary) {
                setSalaryData(response.data.salary);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/api/employees/profile/${profile.id}`, formData);
            if ((user.role === 'ADMIN' || user.role === 'HR') && activeTab === 'Salary') {
                await axios.put(`http://localhost:5000/api/employees/salary/${profile.id}`, salaryData);
            }
            alert('Profile updated successfully');
            fetchProfile(profile.id, 'emp');
        } catch (error) {
            alert('Update failed');
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
        if (!currentSkills.includes(newSkill.trim())) {
            const updatedSkills = [...currentSkills, newSkill.trim()].join(',');
            setFormData({ ...formData, skills: updatedSkills });
        }
        setNewSkill('');
        setShowSkillInput(false);
    };

    const addCertificate = () => {
        if (!newCert.name.trim() || !newCert.org.trim()) return;
        const currentCerts = formData.certifications ? formData.certifications.split(';') : [];
        const certString = `${newCert.name}|${newCert.org}`;
        const updatedCerts = [...currentCerts, certString].join(';');
        setFormData({ ...formData, certifications: updatedCerts });
        setNewCert({ name: '', org: '' });
        setShowCertInput(false);
    };

    const removeSkill = (skillToRemove) => {
        if (!isEditable) return;
        const updatedSkills = formData.skills.split(',')
            .map(s => s.trim())
            .filter(s => s !== skillToRemove)
            .join(',');
        setFormData({ ...formData, skills: updatedSkills });
    };

    const calculateSalary = (wage) => {
        const val = parseFloat(wage) || 0;
        const basic = val * (parseFloat(salaryData.basic_pct) / 100 || 0.5);
        const hra = basic * (parseFloat(salaryData.hra_pct) / 100 || 0.5);
        const lta = val * (parseFloat(salaryData.lta_pct) / 100 || 0.0833);
        const bonus = val * (parseFloat(salaryData.performance_bonus_pct) / 100 || 0.0833);
        const stdAllowance = parseFloat(salaryData.standard_allowance) || 0;
        
        const fixed = val - (basic + hra + lta + bonus + stdAllowance);
        const pf = basic * (parseFloat(salaryData.pf_pct) / 100 || 0.12);
        const profTax = parseFloat(salaryData.prof_tax) || 200;

        return { basic, hra, lta, bonus, stdAllowance, fixed, pf, profTax, yearly: val * 12 };
    };

    if (loading) return <div className="p-10">Loading Profile...</div>;
    if (!profile) return <div className="p-10">Profile not found.</div>;

    const calcs = calculateSalary(salaryData.monthly_wage);
    const canManageSalary = user.role === 'ADMIN' || user.role === 'HR';

    return (
        <div className="dashboard-container">
            <Navbar user={user} activeTab="" setActiveTab={() => navigate('/dashboard')} />
            
            <div className="profile-container" style={{ paddingTop: '40px' }}>
                <div className="profile-header-card">
                    <div className="profile-left-summary">
                        <div className="profile-avatar-large">
                            {profile.full_name?.[0]}{profile.full_name?.split(' ')[1]?.[0]}
                            <div className="profile-status-dot online"></div>
                        </div>
                        <h2 className="profile-name">{profile.full_name}</h2>
                        <p className="profile-designation">{profile.designation || 'Specialist'}</p>
                        <p className="profile-emp-id">ID: {profile.employee_code}</p>

                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="icon">📧</span> {profile.auth_email}
                            </div>
                            <div className="summary-item">
                                <span className="icon">📱</span> {profile.phone || 'Not set'}
                            </div>
                            <div className="summary-item">
                                <span className="icon">📍</span> {profile.location || 'Not set'}
                            </div>
                            <div className="summary-item">
                                <span className="icon">🏢</span> {profile.department || 'General'}
                            </div>
                            <div className="summary-item">
                                <span className="icon">👤</span> Manager: {profile.manager_name || 'HR Team'}
                            </div>
                        </div>
                    </div>

                    <div className="profile-right-content">
                        <div className="profile-tabs-nav">
                            {['Private Info', 'Salary Info', 'Resume'].map(tab => {
                                // Salary visible to Admin/HR OR if it's user's OWN profile
                                if (tab === 'Salary Info' && !(user.role === 'ADMIN' || user.role === 'HR' || isOwnProfile)) return null;
                                return (
                                    <div 
                                        key={tab} 
                                        className={`profile-tab-item ${activeTab === (tab === 'Salary Info' ? 'Salary' : tab) ? 'active' : ''}`}
                                        onClick={() => setProfileTab(tab === 'Salary Info' ? 'Salary' : tab)}
                                    >
                                        {tab}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="tab-content-pane">
                            {activeTab === 'Resume' && (
                                <div className="resume-tab">
                                    <div className="resume-section">
                                        <label>About</label>
                                        <textarea 
                                            name="about" 
                                            value={formData.about || ''} 
                                            onChange={handleFormChange} 
                                            rows="5"
                                            disabled={!isEditable}
                                            placeholder="What I love about my job / My career path..."
                                            className="stylish-textarea"
                                        />
                                    </div>

                                    <div className="resume-section">
                                        <label>
                                            Skills
                                            {isEditable && (
                                                <button className="add-action-btn" onClick={() => setShowSkillInput(true)}>
                                                    + Add Skill
                                                </button>
                                            )}
                                        </label>
                                        {showSkillInput && (
                                            <div className="inline-add-form" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Type a skill..." 
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                                />
                                                <button className="btn-save" onClick={addSkill} style={{ padding: '5px 15px' }}>Add</button>
                                                <button className="btn-secondary" onClick={() => setShowSkillInput(false)} style={{ padding: '5px 15px' }}>Cancel</button>
                                            </div>
                                        )}
                                        <div className="skill-tags">
                                            {(formData.skills || '').split(',').filter(s => s.trim()).map((skill, idx) => (
                                                <span key={idx} className="skill-tag">
                                                    {skill.trim()}
                                                    {isEditable && <span style={{ marginLeft: '8px', cursor: 'pointer', opacity: 0.6 }} onClick={() => removeSkill(skill.trim())}>×</span>}
                                                </span>
                                            ))}
                                            {!(formData.skills?.trim()) && <p className="text-muted" style={{ fontSize: '0.9rem' }}>No skills added yet.</p>}
                                        </div>
                                    </div>

                                    <div className="resume-section">
                                        <label>Interests & Hobbies</label>
                                        <textarea 
                                            name="interests" 
                                            value={formData.interests || ''} 
                                            onChange={handleFormChange} 
                                            rows="3"
                                            disabled={!isEditable}
                                            placeholder="Cycling, Reading, Coding..."
                                        />
                                    </div>

                                    <div className="resume-section">
                                        <label>
                                            Certifications
                                            {isEditable && (
                                                <button className="add-action-btn" onClick={() => setShowCertInput(true)}>
                                                    + Add Certificate
                                                </button>
                                            )}
                                        </label>
                                        {showCertInput && (
                                            <div className="inline-add-form" style={{ marginBottom: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <div className="profile-grid" style={{ marginBottom: '15px' }}>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Certificate Name" 
                                                            value={newCert.name}
                                                            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Issued By" 
                                                            value={newCert.org}
                                                            onChange={(e) => setNewCert({ ...newCert, org: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button className="btn-save" onClick={addCertificate}>Save Certificate</button>
                                                    <button className="btn-secondary" onClick={() => setShowCertInput(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="certification-grid">
                                            {(formData.certifications || '').split(';').filter(c => c.trim()).map((cert, idx) => (
                                                <div key={idx} className="certification-card">
                                                    <span className="cert-icon">🏆</span>
                                                    <div className="cert-info">
                                                        <h4>{cert.split('|')[0] || 'Certificate'}</h4>
                                                        <p>{cert.split('|')[1] || 'Issued by Organization'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {!(formData.certifications?.trim()) && <p className="text-muted" style={{ fontSize: '0.9rem' }}>No certifications listed.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Private Info' && (
                                <div className="private-tab">
                                    <div className="section-title">Personal Details</div>
                                    <div className="profile-grid">
                                        <div className="form-field">
                                            <label>Date of Birth</label>
                                            <input type="date" name="dob" value={formData.dob?.split('T')[0] || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                        <div className="form-field">
                                            <label>Gender</label>
                                            <select name="gender" value={formData.gender || ''} onChange={handleFormChange} disabled={!isEditable}>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Marital Status</label>
                                            <select name="marital_status" value={formData.marital_status || ''} onChange={handleFormChange} disabled={!isEditable}>
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label>Nationality</label>
                                            <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleFormChange} disabled={!isEditable} placeholder="e.g. Indian" />
                                        </div>
                                        <div className="form-field">
                                            <label>Personal Email</label>
                                            <input type="email" name="personal_email" value={formData.personal_email || ''} onChange={handleFormChange} disabled={!isEditable} placeholder="personal@email.com" />
                                        </div>
                                        <div className="form-field">
                                            <label>Address</label>
                                            <input type="text" name="address" value={formData.address || ''} onChange={handleFormChange} disabled={!isEditable} placeholder="Residing Address" />
                                        </div>
                                        <div className="form-field">
                                            <label>Date of Joining</label>
                                            <input type="date" value={profile.joining_date?.split('T')[0] || ''} disabled />
                                        </div>
                                    </div>
                                    
                                    <div className="section-title">Bank Details</div>
                                    <div className="profile-grid">
                                        <div className="form-field">
                                            <label>Bank Name</label>
                                            <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                        <div className="form-field">
                                            <label>Account Number</label>
                                            <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                        <div className="form-field">
                                            <label>IFSC Code</label>
                                            <input type="text" name="ifsc_code" value={formData.ifsc_code || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                        <div className="form-field">
                                            <label>PAN No</label>
                                            <input type="text" name="pan_no" value={formData.pan_no || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                        <div className="form-field">
                                            <label>UAN No</label>
                                            <input type="text" name="uan_no" value={formData.uan_no || ''} onChange={handleFormChange} disabled={!isEditable} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Salary' && (
                                <div className="salary-tab">
                                    {/* Summary Cards Row */}
                                    <div className="salary-wage-box">
                                        <div className="wage-card">
                                            <span className="wage-label">Monthly Wage</span>
                                            <div className="wage-value">₹ {parseFloat(salaryData.monthly_wage || 0).toLocaleString()} <span className="wage-sub">/ Month</span></div>
                                        </div>
                                        <div className="wage-card">
                                            <span className="wage-label">Yearly Wage</span>
                                            <div className="wage-value">₹ {calcs.yearly.toLocaleString()} <span className="wage-sub">/ Yearly</span></div>
                                        </div>
                                        <div className="wage-card">
                                            <span className="wage-label">Working Days</span>
                                            <div className="wage-value">{salaryData.working_days || 5} <span className="wage-sub">days in a week</span></div>
                                        </div>
                                        <div className="wage-card">
                                            <span className="wage-label">Break Time</span>
                                            <div className="wage-value">1 <span className="wage-sub">hr / day</span></div>
                                        </div>
                                    </div>

                                    <div className="salary-main-grid">
                                        <div className="salary-left-col">
                                            <div className="section-header-row">
                                                <span style={{ fontSize: '1.2rem' }}>💵</span>
                                                <h3>Salary Components</h3>
                                            </div>

                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div>
                                                        <span className="comp-name">Basic Salary</span>
                                                        <span className="comp-desc">Base salary from company cost compute it based on monthly wages</span>
                                                    </div>
                                                    <div className="comp-amount">
                                                        ₹ {calcs.basic.toLocaleString()} / <span className="wage-sub">month</span>
                                                        <div className="wage-sub">{salaryData.basic_pct || 50}.00%</div>
                                                    </div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-purple" style={{ width: `${salaryData.basic_pct || 50}%` }}></div></div>
                                            </div>

                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div>
                                                        <span className="comp-name">House Rent Allowance</span>
                                                        <span className="comp-desc">HRA provided to employees 50% of the basic salary</span>
                                                    </div>
                                                    <div className="comp-amount">
                                                        ₹ {calcs.hra.toLocaleString()} / <span className="wage-sub">month</span>
                                                        <div className="wage-sub">{salaryData.hra_pct || 50}.00%</div>
                                                    </div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-purple" style={{ width: `${salaryData.hra_pct || 50}%` }}></div></div>
                                            </div>

                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div>
                                                        <span className="comp-name">Standard Allowance</span>
                                                        <span className="comp-desc">A standard allowance is a predetermined, fixed amount provided as part of salary</span>
                                                    </div>
                                                    <div className="comp-amount">
                                                        ₹ {parseFloat(salaryData.standard_allowance || 0).toLocaleString()} / <span className="wage-sub">month</span>
                                                        <div className="wage-sub">{((parseFloat(salaryData.standard_allowance || 0) / parseFloat(salaryData.monthly_wage || 1)) * 100).toFixed(2)}%</div>
                                                    </div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-purple" style={{ width: `${((parseFloat(salaryData.standard_allowance || 0) / parseFloat(salaryData.monthly_wage || 1)) * 100).toFixed(2)}%` }}></div></div>
                                            </div>

                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div>
                                                        <span className="comp-name">Performance Bonus</span>
                                                        <span className="comp-desc">Variable amount paid during payroll. The value is defined by the company</span>
                                                    </div>
                                                    <div className="comp-amount">
                                                        ₹ {calcs.bonus.toLocaleString()} / <span className="wage-sub">month</span>
                                                        <div className="wage-sub">{salaryData.performance_bonus_pct || 8.33}%</div>
                                                    </div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-purple" style={{ width: `${salaryData.performance_bonus_pct || 8.33}%` }}></div></div>
                                            </div>
                                        </div>

                                        <div className="salary-right-col">
                                            <div className="section-header-row">
                                                <span style={{ fontSize: '1.2rem' }}>💰</span>
                                                <h3>Provident Fund (PF)</h3>
                                            </div>
                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div><span className="comp-name">Employee</span><span className="comp-desc">PF is calculated based on basic salary</span></div>
                                                    <div className="comp-amount">₹ {calcs.pf.toLocaleString()} / <span className="wage-sub">month</span><div className="wage-sub">{salaryData.pf_pct || 12}.00%</div></div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-orange" style={{ width: `${salaryData.pf_pct || 12}%` }}></div></div>
                                            </div>
                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div><span className="comp-name">Employer</span><span className="comp-desc">PF is calculated based on basic salary</span></div>
                                                    <div className="comp-amount">₹ {calcs.pf.toLocaleString()} / <span className="wage-sub">month</span><div className="wage-sub">{salaryData.pf_pct || 12}.00%</div></div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-orange" style={{ width: `${salaryData.pf_pct || 12}%` }}></div></div>
                                            </div>

                                            <div className="section-header-row" style={{ marginTop: '30px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                                                <h3>Tax Deductions</h3>
                                            </div>
                                            <div className="component-row">
                                                <div className="component-info">
                                                    <div><span className="comp-name">Professional Tax</span><span className="comp-desc">Tax deducted from the Gross salary</span></div>
                                                    <div className="comp-amount">₹ {parseFloat(salaryData.prof_tax || 200).toLocaleString()} / <span className="wage-sub">month</span></div>
                                                </div>
                                                <div className="progress-container"><div className="progress-bar bar-red" style={{ width: '10%' }}></div></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin View Settings Control - Toggle or Modal would be better, but for now we can show it below if Admin */}
                                    {canManageSalary && (
                                        <div className="admin-salary-editor" style={{ marginTop: '50px', borderTop: '2px dashed #f1f5f9', paddingTop: '30px' }}>
                                            <h4>Admin Settings: Edit Salary Structure</h4>
                                            <div className="profile-grid">
                                                <div className="form-field">
                                                    <label>Monthly Wage</label>
                                                    <input type="number" value={salaryData.monthly_wage} onChange={(e) => setSalaryData({...salaryData, monthly_wage: e.target.value})} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Basic %</label>
                                                    <input type="number" value={salaryData.basic_pct} onChange={(e) => setSalaryData({...salaryData, basic_pct: e.target.value})} />
                                                </div>
                                                <div className="form-field">
                                                    <label>HRA %</label>
                                                    <input type="number" value={salaryData.hra_pct} onChange={(e) => setSalaryData({...salaryData, hra_pct: e.target.value})} />
                                                </div>
                                                <div className="form-field">
                                                    <label>Standard Allow.</label>
                                                    <input type="number" value={salaryData.standard_allowance} onChange={(e) => setSalaryData({...salaryData, standard_allowance: e.target.value})} />
                                                </div>
                                                <div className="form-field">
                                                    <label>PF %</label>
                                                    <input type="number" value={salaryData.pf_pct} onChange={(e) => setSalaryData({...salaryData, pf_pct: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="profile-bottom-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
                                        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Close</button>
                                        <button className="btn-download-pdf">Download Profile PDF</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(isEditable && activeTab !== 'Salary') && (
                            <div className="profile-actions" style={{ marginTop: '40px' }}>
                                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                                <button className="btn-save" onClick={handleSave} style={{ boxShadow: '0 4px 12px rgba(217, 70, 239, 0.3)' }}>Update Profile</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

