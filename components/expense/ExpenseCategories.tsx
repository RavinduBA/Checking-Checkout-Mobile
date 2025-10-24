import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ExpenseType } from "../../hooks/useExpenseData";

interface ExpenseFormData {
  mainCategory: string;
  subCategory: string;
  amount: string;
  accountId: string;
  date: string;
  note: string;
  currency: "LKR" | "USD";
}

interface ExpenseCategoriesProps {
  formData: ExpenseFormData;
  expenseTypes: ExpenseType[];
  onFormDataChange: (data: Partial<ExpenseFormData>) => void;
  showMainCategoryDropdown: boolean;
  showSubCategoryDropdown: boolean;
  setShowMainCategoryDropdown: (show: boolean) => void;
  setShowSubCategoryDropdown: (show: boolean) => void;
}

export function ExpenseCategories({
  formData,
  expenseTypes,
  onFormDataChange,
  showMainCategoryDropdown,
  showSubCategoryDropdown,
  setShowMainCategoryDropdown,
  setShowSubCategoryDropdown,
}: ExpenseCategoriesProps) {
  const mainCategories = [...new Set(expenseTypes.map((et) => et.main_type))];
  const subCategories = expenseTypes
    .filter((et) => et.main_type === formData.mainCategory)
    .map((et) => et.sub_type);

  const handleMainCategoryChange = (value: string) => {
    const newSubCategory =
      formData.subCategory && subCategories.includes(formData.subCategory)
        ? formData.subCategory
        : "";

    onFormDataChange({
      mainCategory: value,
      subCategory: newSubCategory,
    });
  };

  return (
    <View className="gap-4">
      {/* Main Category */}
      <View>
        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
          Main Category *
        </Text>
        <View>
          <TouchableOpacity
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
            onPress={() =>
              setShowMainCategoryDropdown(!showMainCategoryDropdown)
            }
          >
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons
                name="folder-outline"
                size={18}
                color={formData.mainCategory ? "#3b82f6" : "#9ca3af"}
              />
              <Text
                className={
                  formData.mainCategory
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400"
                }
                numberOfLines={1}
              >
                {formData.mainCategory || "Choose category"}
              </Text>
            </View>
            <Ionicons
              name={showMainCategoryDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {showMainCategoryDropdown && (
            <View className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {mainCategories.length === 0 ? (
                <View className="px-4 py-8 items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#3b82f6"
                  />
                  <Text className="text-gray-600 text-center mt-2 mb-1 font-medium">
                    No categories found
                  </Text>
                  <Text className="text-xs text-gray-400 text-center">
                    Add categories in Settings
                  </Text>
                </View>
              ) : (
                mainCategories.map((category, index) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-3 flex-row items-center gap-3 ${
                      index < mainCategories.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    onPress={() => {
                      handleMainCategoryChange(category);
                      setShowMainCategoryDropdown(false);
                    }}
                  >
                    <View className="bg-blue-50 rounded-lg p-2">
                      <Ionicons name="folder" size={16} color="#3b82f6" />
                    </View>
                    <Text className="font-semibold text-gray-900 capitalize flex-1">
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      {/* Sub Category */}
      <View>
        <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
          Sub Category *
        </Text>
        <View>
          <TouchableOpacity
            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between ${
              !formData.mainCategory ? "opacity-50" : ""
            }`}
            onPress={() => {
              if (formData.mainCategory) {
                setShowSubCategoryDropdown(!showSubCategoryDropdown);
              }
            }}
            disabled={!formData.mainCategory}
          >
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={formData.subCategory ? "#3b82f6" : "#9ca3af"}
              />
              <Text
                className={
                  !formData.mainCategory
                    ? "text-gray-400"
                    : formData.subCategory
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400"
                }
                numberOfLines={1}
              >
                {!formData.mainCategory
                  ? "Select main first"
                  : formData.subCategory || "Choose sub-category"}
              </Text>
            </View>
            <Ionicons
              name={showSubCategoryDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {showSubCategoryDropdown && formData.mainCategory && (
            <View className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {subCategories.map((subCategory, index) => (
                <TouchableOpacity
                  key={subCategory}
                  className={`px-4 py-3 flex-row items-center gap-3 ${
                    index < subCategories.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                  onPress={() => {
                    onFormDataChange({ subCategory });
                    setShowSubCategoryDropdown(false);
                  }}
                >
                  <View className="bg-blue-50 rounded-lg p-2">
                    <Ionicons name="pricetag" size={16} color="#3b82f6" />
                  </View>
                  <Text className="font-semibold text-gray-900 capitalize flex-1">
                    {subCategory}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
