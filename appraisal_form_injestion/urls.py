from django.urls import path
from .views import (
    GetItemBySection,
    InjestItem1to10,
    InjestItem11,
    InjestItem12_1,
    InjestItem12_3_to_12_4,
    InjestItem13,
    InjestItem14,
    InjestItem15,
    InjestItem16,
    InjestItem17,
    InjestItem18,
    InjestItem19,
)
urlpatterns = [
    path("get-item-by-section/", GetItemBySection.as_view(), name="get-item-by-section"),
    path("injest-item-1-to-10/", InjestItem1to10.as_view(), name="injest-item-1-to-10"),
    path("injest-item-11/", InjestItem11.as_view(), name="injest-item-11"),
    path("injest-item-12-1/", InjestItem12_1.as_view(), name="injest-item-12-1"),
    path("injest-item-12-3-to-12-4/", InjestItem12_3_to_12_4.as_view(), name="injest-item-12-3-to-12-4"),
    path("injest-item-13/", InjestItem13.as_view(), name="injest-item-13"),
    path("injest-item-14/", InjestItem14.as_view(), name="injest-item-14"),
    path("injest-item-15/", InjestItem15.as_view(), name="injest-item-15"),
    path("injest-item-16/", InjestItem16.as_view(), name="injest-item-16"),
    path("injest-item-17/", InjestItem17.as_view(), name="injest-item-17"),
    path("injest-item-18/", InjestItem18.as_view(), name="injest-item-18"),
    path("injest-item-19/", InjestItem19.as_view(), name="injest-item-19"),
]
