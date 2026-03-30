from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.roles import router as roles_router
from app.api.v1.permissions import router as permissions_router
from app.api.v1.services import router as services_router
from app.api.v1.channels import router as channels_router
from app.api.v1.pages import router as pages_router
from app.api.v1.page_accounts import router as page_accounts_router
from app.api.v1.page_groups import router as page_groups_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.customers import router as customers_router
from app.api.v1.leads import router as leads_router
from app.api.v1.tele_groups import router as tele_groups_router
from app.api.v1.tele import router as tele_router, followup_router, appointment_router
from app.api.v1.routing import router as routing_router
from app.api.v1.scripts import router as scripts_router
from app.api.v1.settings import router as settings_router
from app.api.v1.webhook import router as webhook_router
from app.api.v1.ws import router as ws_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(roles_router)
router.include_router(permissions_router)
router.include_router(services_router)
router.include_router(channels_router)
router.include_router(pages_router)
router.include_router(page_accounts_router)
router.include_router(page_groups_router)
router.include_router(conversations_router)
router.include_router(customers_router)
router.include_router(leads_router)
router.include_router(tele_groups_router)
router.include_router(tele_router)
router.include_router(followup_router)
router.include_router(appointment_router)
router.include_router(routing_router)
router.include_router(scripts_router)
router.include_router(settings_router)
router.include_router(webhook_router)
router.include_router(ws_router)
