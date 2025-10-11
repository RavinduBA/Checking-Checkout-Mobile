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
    <View className="space-y-6">
      {/* Main Category */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Main Category *
        </Text>
        <View>
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
            onPress={() =>
              setShowMainCategoryDropdown(!showMainCategoryDropdown)
            }
          >
            <Text
              className={
                formData.mainCategory
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
              }
            >
              {formData.mainCategory || "Select main category"}
            </Text>
            <Ionicons
              name={showMainCategoryDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showMainCategoryDropdown && (
            <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
              {mainCategories.length === 0 ? (
                <View className="px-4 py-6 items-center">
                  <Text className="text-gray-500 text-center mb-2">
                    No expense categories found
                  </Text>
                  <Text className="text-sm text-gray-400 text-center">
                    Go to Settings {"->"} Expense Categories to add some
                  </Text>
                </View>
              ) : (
                mainCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                    onPress={() => {
                      handleMainCategoryChange(category);
                      setShowMainCategoryDropdown(false);
                    }}
                  >
                    <Text className="font-medium text-gray-800 capitalize">
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
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Sub Category *
        </Text>
        <View>
          <TouchableOpacity
            className={`bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between ${
              !formData.mainCategory ? "bg-gray-100" : ""
            }`}
            onPress={() => {
              if (formData.mainCategory) {
                setShowSubCategoryDropdown(!showSubCategoryDropdown);
              }
            }}
            disabled={!formData.mainCategory}
          >
            <Text
              className={
                !formData.mainCategory
                  ? "text-gray-400"
                  : formData.subCategory
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
              }
            >
              {!formData.mainCategory
                ? "Select main category first"
                : formData.subCategory || "Select sub category"}
            </Text>
            <Ionicons
              name={showSubCategoryDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color={!formData.mainCategory ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>

          {showSubCategoryDropdown && formData.mainCategory && (
            <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
              {subCategories.map((subCategory) => (
                <TouchableOpacity
                  key={subCategory}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    onFormDataChange({ subCategory });
                    setShowSubCategoryDropdown(false);
                  }}
                >
                  <Text className="font-medium text-gray-800 capitalize">
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
