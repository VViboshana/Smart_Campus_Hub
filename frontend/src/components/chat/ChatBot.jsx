import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiX, FiSend, FiChevronDown, FiExternalLink, FiCheck, FiXCircle } from 'react-icons/fi';
import { chatAPI, resourceAPI } from '../../services/api';

// ── Flow step definitions ──
const BOOKING_STEPS = ['resource', 'date', 'startTime', 'endTime', 'purpose', 'attendees', 'confirm'];
const TICKET_STEPS = ['title', 'description', 'category', 'priority', 'location', 'confirm'];

const TICKET_CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡' },
  { value: 'PLUMBING', label: 'Plumbing', icon: '🔧' },
  { value: 'IT_EQUIPMENT', label: 'IT Equipment', icon: '💻' },
  { value: 'FURNITURE', label: 'Furniture', icon: '🪑' },
  { value: 'HVAC', label: 'HVAC', icon: '❄️' },
  { value: 'CLEANING', label: 'Cleaning', icon: '🧹' },
  { value: 'SAFETY', label: 'Safety', icon: '🛡️' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

const TICKET_PRIORITIES = [
  { value: 'LOW', label: 'Low', icon: '🟢' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡' },
  { value: 'HIGH', label: 'High', icon: '🟠' },
  { value: 'CRITICAL', label: 'Critical', icon: '🔴' },
];

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);

  // Flow state
  const [activeFlow, setActiveFlow] = useState(null); // 'booking' | 'ticket' | null
  const [flowStep, setFlowStep] = useState(0);
  const [flowData, setFlowData] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Helpers ──
  const addBotMsg = useCallback((text, actions = [], suggestions = []) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'bot',
      text,
      actions,
      suggestions,
    }]);
  }, []);

  const addUserMsg = useCallback((text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: 'user',
      text,
    }]);
  }, []);

  // ── Initialize welcome message ──
  useEffect(() => {
    setMessages([{
      id: 1,
      type: 'bot',
      text: '👋 Hi! I\'m the Smart Campus Hub assistant. I can **book resources**, **raise tickets**, navigate you around, and more!',
      suggestions: [],
      actions: [
        { label: 'Book a Resource', type: 'flow', value: 'booking', icon: '📅' },
        { label: 'Raise a Ticket', type: 'flow', value: 'ticket', icon: '🎫' },
        { label: 'Browse Resources', type: 'navigate', value: '/resources', icon: '📋' },
        { label: 'My Bookings', type: 'navigate', value: '/bookings', icon: '📅' },
        { label: 'My Tickets', type: 'navigate', value: '/tickets', icon: '🎫' },
        { label: 'What can you do?', type: 'query', value: 'What can you do?', icon: '❓' },
      ],
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // ── Fetch resources for booking flow ──
  const fetchResources = useCallback(async () => {
    try {
      const res = await resourceAPI.getAll();
      const active = (res.data.data || []).filter(r => r.status === 'ACTIVE');
      setResources(active);
      return active;
    } catch {
      return [];
    }
  }, []);

  // ── Start a flow ──
  const startBookingFlow = useCallback(async () => {
    setActiveFlow('booking');
    setFlowStep(0);
    setFlowData({});
    setLoading(true);
    const res = await fetchResources();
    setLoading(false);

    if (res.length === 0) {
      addBotMsg('😕 No active resources found. An admin needs to add resources first.', [
        { label: 'Add Resource (Admin)', type: 'navigate', value: '/resources/create', icon: '➕' },
        { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
      ]);
      setActiveFlow(null);
      return;
    }

    addBotMsg(
      '📅 **Let\'s book a resource!** Which resource would you like to book?\n\n*(Select from the options below or type the name)*',
      res.map(r => ({
        label: `${r.name} (${r.type?.replace(/_/g, ' ')}${r.capacity > 0 ? ` • Cap: ${r.capacity}` : ''})`,
        type: 'select',
        value: r.id,
        icon: '🏫',
      })).concat([{ label: 'Cancel', type: 'cancel', value: '', icon: '❌' }])
    );
  }, [addBotMsg, fetchResources]);

  const startTicketFlow = useCallback(() => {
    setActiveFlow('ticket');
    setFlowStep(0);
    setFlowData({});
    addBotMsg(
      '🎫 **Let\'s raise a support ticket!**\n\nWhat\'s the **title** of your issue? *(A brief summary)*',
      [{ label: 'Cancel', type: 'cancel', value: '', icon: '❌' }]
    );
  }, [addBotMsg]);

  // ── Booking flow step handler ──
  const handleBookingStep = useCallback((userInput, selectValue) => {
    const step = BOOKING_STEPS[flowStep];
    const newData = { ...flowData };

    switch (step) {
      case 'resource': {
        if (selectValue) {
          newData.resourceId = selectValue;
          const res = resources.find(r => r.id === selectValue);
          newData._resourceName = res?.name || 'Selected resource';
          addUserMsg(newData._resourceName);
        } else {
          const match = resources.find(r => r.name.toLowerCase().includes(userInput.toLowerCase()));
          if (!match) {
            addBotMsg('⚠️ Resource not found. Please select from the options below:', 
              resources.map(r => ({
                label: `${r.name} (${r.type?.replace(/_/g, ' ')})`,
                type: 'select', value: r.id, icon: '🏫',
              })).concat([{ label: 'Cancel', type: 'cancel', value: '', icon: '❌' }])
            );
            return;
          }
          newData.resourceId = match.id;
          newData._resourceName = match.name;
        }
        setFlowData(newData);
        setFlowStep(1);
        addBotMsg('📆 What **date** would you like to book? *(e.g. 2026-03-15)*', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'date': {
        const dateMatch = userInput.match(/(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) {
          addBotMsg('⚠️ Please enter a valid date in **YYYY-MM-DD** format (e.g. 2026-03-15)');
          return;
        }
        const today = new Date().toISOString().split('T')[0];
        if (dateMatch[1] < today) {
          addBotMsg('⚠️ Date must be today or in the future. Please try again.');
          return;
        }
        newData.bookingDate = dateMatch[1];
        setFlowData(newData);
        setFlowStep(2);
        addBotMsg('🕐 What **start time**? *(e.g. 09:00)*', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'startTime': {
        const timeMatch = userInput.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) {
          addBotMsg('⚠️ Please enter a valid time in **HH:MM** format (e.g. 09:00)');
          return;
        }
        const h = timeMatch[1].padStart(2, '0');
        newData.startTime = `${h}:${timeMatch[2]}`;
        setFlowData(newData);
        setFlowStep(3);
        addBotMsg('🕑 What **end time**? *(e.g. 10:00)*', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'endTime': {
        const timeMatch = userInput.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) {
          addBotMsg('⚠️ Please enter a valid time in **HH:MM** format (e.g. 10:00)');
          return;
        }
        const h = timeMatch[1].padStart(2, '0');
        const endTime = `${h}:${timeMatch[2]}`;
        if (endTime <= newData.startTime) {
          addBotMsg('⚠️ End time must be **after** the start time. Please try again.');
          return;
        }
        newData.endTime = endTime;
        setFlowData(newData);
        setFlowStep(4);
        addBotMsg('📝 What\'s the **purpose** of this booking?', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'purpose': {
        if (userInput.trim().length < 2) {
          addBotMsg('⚠️ Please provide a purpose for the booking.');
          return;
        }
        newData.purpose = userInput.trim();
        setFlowData(newData);
        setFlowStep(5);
        addBotMsg('👥 How many **expected attendees**? *(Enter a number, e.g. 10)*', [
          { label: 'Skip (set to 1)', type: 'select', value: '1', icon: '⏭️' },
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'attendees': {
        const num = parseInt(selectValue || userInput);
        if (isNaN(num) || num < 1) {
          addBotMsg('⚠️ Please enter a valid number (at least 1).');
          return;
        }
        newData.expectedAttendees = num;
        setFlowData(newData);
        setFlowStep(6);
        addBotMsg(
          `✅ **Booking Summary:**\n\n` +
          `• **Resource:** ${newData._resourceName}\n` +
          `• **Date:** ${newData.bookingDate}\n` +
          `• **Time:** ${newData.startTime} — ${newData.endTime}\n` +
          `• **Purpose:** ${newData.purpose}\n` +
          `• **Attendees:** ${newData.expectedAttendees}\n\n` +
          `Submit this booking?`,
          [
            { label: 'Confirm & Submit', type: 'confirm', value: 'yes', icon: '✅' },
            { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
          ]
        );
        break;
      }
      case 'confirm': {
        // handled by confirm action button
        break;
      }
      default:
        break;
    }
  }, [flowStep, flowData, resources, addBotMsg, addUserMsg]);

  // ── Ticket flow step handler ──
  const handleTicketStep = useCallback((userInput, selectValue) => {
    const step = TICKET_STEPS[flowStep];
    const newData = { ...flowData };

    switch (step) {
      case 'title': {
        if (userInput.trim().length < 3) {
          addBotMsg('⚠️ Please enter a title (at least 3 characters).');
          return;
        }
        newData.title = userInput.trim();
        setFlowData(newData);
        setFlowStep(1);
        addBotMsg('📝 Please describe the issue in **detail**:', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'description': {
        if (userInput.trim().length < 5) {
          addBotMsg('⚠️ Please provide a more detailed description.');
          return;
        }
        newData.description = userInput.trim();
        setFlowData(newData);
        setFlowStep(2);
        addBotMsg(
          '📂 Select a **category** for this issue:',
          TICKET_CATEGORIES.map(c => ({
            label: `${c.icon} ${c.label}`, type: 'select', value: c.value, icon: c.icon,
          })).concat([{ label: 'Cancel', type: 'cancel', value: '', icon: '❌' }])
        );
        break;
      }
      case 'category': {
        const cat = selectValue || TICKET_CATEGORIES.find(c => 
          c.label.toLowerCase() === userInput.toLowerCase() || c.value.toLowerCase() === userInput.toLowerCase()
        )?.value;
        if (!cat) {
          addBotMsg('⚠️ Please select a valid category from the options below:',
            TICKET_CATEGORIES.map(c => ({
              label: `${c.icon} ${c.label}`, type: 'select', value: c.value, icon: c.icon,
            }))
          );
          return;
        }
        newData.category = cat;
        newData._categoryLabel = TICKET_CATEGORIES.find(c => c.value === cat)?.label || cat;
        setFlowData(newData);
        setFlowStep(3);
        addBotMsg(
          '🚨 How **urgent** is this issue?',
          TICKET_PRIORITIES.map(p => ({
            label: `${p.icon} ${p.label}`, type: 'select', value: p.value, icon: p.icon,
          })).concat([{ label: 'Cancel', type: 'cancel', value: '', icon: '❌' }])
        );
        break;
      }
      case 'priority': {
        const pri = selectValue || TICKET_PRIORITIES.find(p =>
          p.label.toLowerCase() === userInput.toLowerCase() || p.value.toLowerCase() === userInput.toLowerCase()
        )?.value;
        if (!pri) {
          addBotMsg('⚠️ Please select a valid priority from the options below:',
            TICKET_PRIORITIES.map(p => ({
              label: `${p.icon} ${p.label}`, type: 'select', value: p.value, icon: p.icon,
            }))
          );
          return;
        }
        newData.priority = pri;
        newData._priorityLabel = TICKET_PRIORITIES.find(p => p.value === pri)?.label || pri;
        setFlowData(newData);
        setFlowStep(4);
        addBotMsg('📍 What is the **location** of this issue? *(e.g. Building A, Room 301)*', [
          { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
        ]);
        break;
      }
      case 'location': {
        if (userInput.trim().length < 2) {
          addBotMsg('⚠️ Please enter a valid location.');
          return;
        }
        newData.location = userInput.trim();
        setFlowData(newData);
        setFlowStep(5);
        addBotMsg(
          `✅ **Ticket Summary:**\n\n` +
          `• **Title:** ${newData.title}\n` +
          `• **Description:** ${newData.description}\n` +
          `• **Category:** ${newData._categoryLabel}\n` +
          `• **Priority:** ${newData._priorityLabel}\n` +
          `• **Location:** ${newData.location}\n\n` +
          `Submit this ticket?`,
          [
            { label: 'Confirm & Submit', type: 'confirm', value: 'yes', icon: '✅' },
            { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
          ]
        );
        break;
      }
      case 'confirm':
        break;
      default:
        break;
    }
  }, [flowStep, flowData, addBotMsg]);

  // ── Submit booking ──
  const submitBooking = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        resourceId: flowData.resourceId,
        bookingDate: flowData.bookingDate,
        startTime: flowData.startTime,
        endTime: flowData.endTime,
        purpose: flowData.purpose,
        expectedAttendees: flowData.expectedAttendees,
      };
      await chatAPI.createBooking(payload);
      setActiveFlow(null);
      setFlowStep(0);
      setFlowData({});
      addBotMsg(
        '🎉 **Booking submitted successfully!** An admin will review and approve it. You\'ll get a notification once reviewed.',
        [
          { label: 'View My Bookings', type: 'navigate', value: '/bookings', icon: '📅' },
          { label: 'Book Another Resource', type: 'flow', value: 'booking', icon: '📅' },
          { label: 'Raise a Ticket', type: 'flow', value: 'ticket', icon: '🎫' },
        ]
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Booking failed. Please try again.';
      addBotMsg(`❌ **Booking failed:** ${errMsg}`, [
        { label: 'Try Again', type: 'flow', value: 'booking', icon: '🔄' },
        { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
      ]);
      setActiveFlow(null);
      setFlowData({});
    } finally {
      setLoading(false);
    }
  }, [flowData, addBotMsg]);

  // ── Submit ticket ──
  const submitTicket = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        title: flowData.title,
        description: flowData.description,
        category: flowData.category,
        priority: flowData.priority,
        location: flowData.location,
      };
      await chatAPI.createTicket(payload);
      setActiveFlow(null);
      setFlowStep(0);
      setFlowData({});
      addBotMsg(
        '🎉 **Ticket submitted successfully!** A technician or admin will review it. You can track its status from your tickets page.',
        [
          { label: 'View My Tickets', type: 'navigate', value: '/tickets', icon: '🎫' },
          { label: 'Raise Another Ticket', type: 'flow', value: 'ticket', icon: '🎫' },
          { label: 'Book a Resource', type: 'flow', value: 'booking', icon: '📅' },
        ]
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Ticket creation failed. Please try again.';
      addBotMsg(`❌ **Ticket failed:** ${errMsg}`, [
        { label: 'Try Again', type: 'flow', value: 'ticket', icon: '🔄' },
        { label: 'Cancel', type: 'cancel', value: '', icon: '❌' },
      ]);
      setActiveFlow(null);
      setFlowData({});
    } finally {
      setLoading(false);
    }
  }, [flowData, addBotMsg]);

  // ── Cancel any flow ──
  const cancelFlow = useCallback(() => {
    setActiveFlow(null);
    setFlowStep(0);
    setFlowData({});
    addBotMsg('❌ Cancelled. How else can I help you?', [
      { label: 'Book a Resource', type: 'flow', value: 'booking', icon: '📅' },
      { label: 'Raise a Ticket', type: 'flow', value: 'ticket', icon: '🎫' },
      { label: 'Browse Resources', type: 'navigate', value: '/resources', icon: '📋' },
      { label: 'Dashboard', type: 'navigate', value: '/', icon: '🏠' },
    ]);
  }, [addBotMsg]);

  // ── Handle action button clicks ──
  const handleActionClick = useCallback((action) => {
    if (action.type === 'navigate') {
      navigate(action.value);
      setIsOpen(false);
    } else if (action.type === 'query') {
      sendMessage(action.value);
    } else if (action.type === 'flow') {
      if (action.value === 'booking') startBookingFlow();
      else if (action.value === 'ticket') startTicketFlow();
    } else if (action.type === 'cancel') {
      cancelFlow();
    } else if (action.type === 'confirm') {
      if (activeFlow === 'booking') submitBooking();
      else if (activeFlow === 'ticket') submitTicket();
    } else if (action.type === 'select') {
      // Handle select within flow
      if (activeFlow === 'booking') {
        addUserMsg(action.label);
        handleBookingStep('', action.value);
      } else if (activeFlow === 'ticket') {
        addUserMsg(action.label);
        handleTicketStep('', action.value);
      }
    }
  }, [navigate, activeFlow, startBookingFlow, startTicketFlow, cancelFlow, submitBooking, submitTicket, handleBookingStep, handleTicketStep, addUserMsg]);

  // ── Send a regular chat message or continue flow ──
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const trimmed = text.trim();

    addUserMsg(trimmed);
    setInput('');

    // If user types cancel during a flow
    if (activeFlow && trimmed.toLowerCase() === 'cancel') {
      cancelFlow();
      return;
    }

    // If in booking flow
    if (activeFlow === 'booking') {
      handleBookingStep(trimmed);
      return;
    }

    // If in ticket flow
    if (activeFlow === 'ticket') {
      handleTicketStep(trimmed);
      return;
    }

    // Check if user wants to start a flow via text
    const lower = trimmed.toLowerCase();
    if (lower.includes('book') && (lower.includes('resource') || lower.includes('room') || lower.includes('hall') || lower.includes('lab') || lower.includes('slot'))) {
      startBookingFlow();
      return;
    }
    if ((lower.includes('raise') || lower.includes('create') || lower.includes('report') || lower.includes('submit')) && (lower.includes('ticket') || lower.includes('issue') || lower.includes('complaint'))) {
      startTicketFlow();
      return;
    }

    // Regular chat to backend
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage(trimmed);
      const data = res.data.data;
      // Inject flow buttons into booking/ticket category responses
      const extraActions = [];
      if (data.category === 'booking') {
        extraActions.push({ label: '📅 Start Booking Now', type: 'flow', value: 'booking', icon: '📅' });
      }
      if (data.category === 'ticket') {
        extraActions.push({ label: '🎫 Start Ticket Now', type: 'flow', value: 'ticket', icon: '🎫' });
      }
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        type: 'bot',
        text: data.reply,
        suggestions: data.suggestions || [],
        actions: [...(data.actions || []), ...extraActions],
      }]);
    } catch {
      addBotMsg('❌ Sorry, something went wrong. Please try again.', [
        { label: 'What can you do?', type: 'query', value: 'What can you do?', icon: '❓' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeFlow, cancelFlow, handleBookingStep, handleTicketStep, startBookingFlow, startTicketFlow, addBotMsg, addUserMsg]);

  // ── Render ──
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  const getActionStyle = (type) => {
    switch (type) {
      case 'navigate': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
      case 'flow': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300';
      case 'confirm': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
      case 'cancel': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300';
      case 'select': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300';
      case 'query': return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'navigate': return <FiExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />;
      case 'confirm': return <FiCheck className="w-3 h-3 flex-shrink-0" />;
      case 'cancel': return <FiXCircle className="w-3 h-3 flex-shrink-0" />;
      default: return null;
    }
  };

  // Flow indicator text
  const getFlowIndicator = () => {
    if (!activeFlow) return null;
    if (activeFlow === 'booking') {
      const stepNames = ['Resource', 'Date', 'Start Time', 'End Time', 'Purpose', 'Attendees', 'Confirm'];
      return `📅 Booking — Step ${flowStep + 1}/${BOOKING_STEPS.length}: ${stepNames[flowStep]}`;
    }
    if (activeFlow === 'ticket') {
      const stepNames = ['Title', 'Description', 'Category', 'Priority', 'Location', 'Confirm'];
      return `🎫 Ticket — Step ${flowStep + 1}/${TICKET_STEPS.length}: ${stepNames[flowStep]}`;
    }
    return null;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 animate-bounce'
        }`}
        style={{ animationIterationCount: isOpen ? 0 : 3 }}
        title={isOpen ? 'Close chat' : 'Chat with assistant'}
      >
        {isOpen ? <FiX className="w-6 h-6 text-white" /> : <FiMessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
             style={{ height: '560px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Campus Assistant</h3>
                <p className="text-blue-100 text-xs">Book, report, navigate</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <FiChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Flow Progress Indicator */}
          {activeFlow && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-200 flex-shrink-0">
              <p className="text-xs font-medium text-amber-800">{getFlowIndicator()}</p>
              <div className="flex gap-1 mt-1">
                {(activeFlow === 'booking' ? BOOKING_STEPS : TICKET_STEPS).map((_, idx) => (
                  <div key={idx} className={`h-1 flex-1 rounded-full ${idx < flowStep ? 'bg-green-400' : idx === flowStep ? 'bg-amber-400' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}>
                    {msg.type === 'bot' ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>

                {/* Action Buttons */}
                {msg.type === 'bot' && msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 ml-1">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left ${getActionStyle(action.type)}`}
                      >
                        <span className="text-sm flex-shrink-0">{action.icon}</span>
                        <span className="flex-1">{action.label}</span>
                        {getActionIcon(action.type)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text suggestions */}
                {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                    {msg.suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => sendMessage(s)} disabled={loading}
                        className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-2.5 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeFlow ? `Enter ${BOOKING_STEPS[flowStep] || TICKET_STEPS[flowStep] || 'your answer'}...` : 'Type your message...'}
                disabled={loading}
                className="flex-1 px-3.5 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 placeholder-gray-400"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
