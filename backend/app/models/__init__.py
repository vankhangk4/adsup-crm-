from app.models.department import Department
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole
from app.models.refresh_token import RefreshToken
from app.models.activity_log import ActivityLog
from app.models.service import Service
from app.models.channel import Channel
from app.models.page import Page
from app.models.page_account import PageAccount
from app.models.page_group import PageGroup, PageGroupMember
from app.models.page_user_assignment import PageUserAssignment
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.conversation_tag import ConversationTag
from app.models.conversation_assignment import ConversationAssignment
from app.models.customer_profile_raw import CustomerProfileRaw
# Nhóm 5
from app.models.customer import Customer
from app.models.customer_tag import CustomerTag
from app.models.lead_source import LeadSource
from app.models.lead_status import LeadStatus
from app.models.lead import Lead
# Nhóm 6
from app.models.tele_group import TeleGroup
from app.models.tele_group_member import TeleGroupMember
from app.models.tele_group_service_permission import TeleGroupServicePermission
from app.models.lead_assignment import LeadAssignment
from app.models.assignment_log import AssignmentLog
from app.models.call_log import CallLog
from app.models.tele_note import TeleNote
from app.models.follow_up_task import FollowUpTask
from app.models.appointment import Appointment
from app.models.tele_status_log import TeleStatusLog
# Nhóm 7
from app.models.routing_rule import RoutingRule
from app.models.lead_queue import LeadQueue
# Nhóm 8
from app.models.script_category import ScriptCategory
from app.models.script import Script
from app.models.script_version import ScriptVersion
from app.models.user_page_permission import UserPagePermission
from app.models.user_service_permission import UserServicePermission
from app.models.system_setting import SystemSetting
from app.models.ai_prompt_template import AiPromptTemplate
from app.models.ai_action_log import AiActionLog

__all__ = [
    "Department", "Permission", "Role", "RolePermission",
    "User", "UserRole", "RefreshToken", "ActivityLog",
    "Service", "Channel", "Page", "PageAccount",
    "PageGroup", "PageGroupMember", "PageUserAssignment",
    "Conversation", "Message", "ConversationTag", "ConversationAssignment",
    "CustomerProfileRaw",
    "Customer", "CustomerTag", "LeadSource", "LeadStatus", "Lead",
    "TeleGroup", "TeleGroupMember", "TeleGroupServicePermission",
    "LeadAssignment", "AssignmentLog",
    "CallLog", "TeleNote", "FollowUpTask", "Appointment", "TeleStatusLog",
    "RoutingRule", "LeadQueue",
    "ScriptCategory", "Script", "ScriptVersion",
    "UserPagePermission", "UserServicePermission",
    "SystemSetting", "AiPromptTemplate", "AiActionLog",
]
